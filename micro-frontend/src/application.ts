/**
 * 应用注册和生命周期管理
 */

import { App, AppConfig, AppStatus, LifeCycles } from './types';
import { isFunction, toPromise } from './utils';

// 存储所有注册的应用
const apps: App[] = [];

/**
 * 注册微应用
 */
export function registerMicroApps(appConfigs: AppConfig[]): void {
  appConfigs.forEach((config) => {
    const existingApp = apps.find(app => app.name === config.name);
    if (existingApp) {
      console.warn(`应用 ${config.name} 已经注册，将被覆盖`);
      Object.assign(existingApp, config);
    } else {
      apps.push({
        ...config,
        status: AppStatus.NOT_LOADED
      });
    }
  });
}

/**
 * 获取所有应用
 */
export function getApps(): App[] {
  return apps;
}

/**
 * 获取指定应用
 */
export function getApp(name: string): App | undefined {
  return apps.find(app => app.name === name);
}

/**
 * 检查应用是否应该激活
 */
export function shouldBeActive(app: App): boolean {
  const { activeRule } = app;
  if (isFunction(activeRule)) {
    return activeRule(window.location);
  }
  // 字符串规则，支持简单的路径匹配
  const path = window.location.pathname;
  if (activeRule.includes('*')) {
    const regex = new RegExp('^' + activeRule.replace(/\*/g, '.*') + '$');
    return regex.test(path);
  }
  return path.startsWith(activeRule);
}

/**
 * 获取所有应该激活的应用
 */
export function getAppsToLoad(): App[] {
  return apps.filter(app => 
    shouldBeActive(app) && app.status === AppStatus.NOT_LOADED
  );
}

/**
 * 获取所有应该挂载的应用
 */
export function getAppsToMount(): App[] {
  return apps.filter(app => 
    shouldBeActive(app) && 
    (app.status === AppStatus.NOT_MOUNTED || app.status === AppStatus.NOT_BOOTSTRAPPED)
  );
}

/**
 * 获取所有应该卸载的应用
 */
export function getAppsToUnmount(): App[] {
  return apps.filter(app => 
    !shouldBeActive(app) && app.status === AppStatus.MOUNTED
  );
}

/**
 * 加载应用
 */
export async function loadApp(app: App): Promise<void> {
  if (app.status !== AppStatus.NOT_LOADED) {
    return;
  }

  app.status = AppStatus.LOADING;
  
  try {
    // 动态导入应用加载器
    const { loadAppEntry } = await import('./loader');
    await loadAppEntry(app);
    app.status = AppStatus.NOT_BOOTSTRAPPED;
  } catch (error) {
    app.status = AppStatus.LOAD_ERROR;
    throw error;
  }
}

/**
 * 启动应用
 */
export async function bootstrapApp(app: App): Promise<void> {
  if (app.status !== AppStatus.NOT_BOOTSTRAPPED) {
    return;
  }

  if (!app.lifeCycles?.bootstrap) {
    app.status = AppStatus.NOT_MOUNTED;
    return;
  }

  app.status = AppStatus.BOOTSTRAPPING;
  
  try {
    await toPromise(app.lifeCycles.bootstrap(app.props));
    app.status = AppStatus.NOT_MOUNTED;
  } catch (error) {
    app.status = AppStatus.SKIP_BECAUSE_BROKEN;
    throw error;
  }
}

/**
 * 挂载应用
 */
export async function mountApp(app: App): Promise<void> {
  if (app.status !== AppStatus.NOT_MOUNTED) {
    return;
  }

  if (!app.lifeCycles?.mount) {
    console.error(`应用 ${app.name} 没有提供 mount 生命周期`);
    app.status = AppStatus.SKIP_BECAUSE_BROKEN;
    return;
  }

  app.status = AppStatus.MOUNTING;

  // 显示加载状态
  if (app.loader) {
    app.loader(true);
  }

  try {
    // 激活沙箱
    if (app.sandbox) {
      app.sandbox.active();
    }

    await toPromise(app.lifeCycles.mount(app.props));
    app.status = AppStatus.MOUNTED;

    // 隐藏加载状态
    if (app.loader) {
      app.loader(false);
    }
  } catch (error) {
    app.status = AppStatus.SKIP_BECAUSE_BROKEN;
    if (app.loader) {
      app.loader(false);
    }
    throw error;
  }
}

/**
 * 卸载应用
 */
export async function unmountApp(app: App): Promise<void> {
  if (app.status !== AppStatus.MOUNTED) {
    return;
  }

  if (!app.lifeCycles?.unmount) {
    console.error(`应用 ${app.name} 没有提供 unmount 生命周期`);
    return;
  }

  app.status = AppStatus.UNMOUNTING;

  try {
    await toPromise(app.lifeCycles.unmount(app.props));
    
    // 停用沙箱
    if (app.sandbox) {
      app.sandbox.inactive();
    }
    
    app.status = AppStatus.NOT_MOUNTED;
  } catch (error) {
    app.status = AppStatus.SKIP_BECAUSE_BROKEN;
    throw error;
  }
}

/**
 * 更新应用
 */
export async function updateApp(app: App, props: Record<string, any>): Promise<void> {
  if (app.status !== AppStatus.MOUNTED) {
    return;
  }

  app.props = { ...app.props, ...props };

  if (app.lifeCycles?.update) {
    await toPromise(app.lifeCycles.update(app.props));
  }
}

/**
 * 卸载并移除应用
 */
export async function unloadApp(name: string): Promise<void> {
  const appIndex = apps.findIndex(app => app.name === name);
  if (appIndex === -1) {
    return;
  }

  const app = apps[appIndex];

  if (app.status === AppStatus.MOUNTED) {
    await unmountApp(app);
  }

  // 销毁沙箱
  if (app.sandbox) {
    app.sandbox.destroy();
  }

  // 移除样式
  if (app.styles) {
    app.styles.forEach(style => style.remove());
  }

  // 移除脚本
  if (app.scripts) {
    app.scripts.forEach(script => script.remove());
  }

  apps.splice(appIndex, 1);
}

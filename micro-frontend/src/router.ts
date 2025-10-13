/**
 * 路由系统和导航拦截
 */

import { 
  getAppsToLoad, 
  getAppsToMount, 
  getAppsToUnmount,
  loadApp,
  bootstrapApp,
  mountApp,
  unmountApp
} from './application';

// 路由变化监听器
type RouteChangeListener = (location: Location) => void;
const routeChangeListeners: RouteChangeListener[] = [];

// 是否已经启动
let isStarted = false;

// 原始的路由方法
const originalPushState = window.history.pushState;
const originalReplaceState = window.history.replaceState;

/**
 * 触发路由变化事件
 */
function triggerRouteChange(location: Location): void {
  routeChangeListeners.forEach(listener => {
    try {
      listener(location);
    } catch (error) {
      console.error('路由监听器执行错误:', error);
    }
  });
}

/**
 * 重写 pushState
 */
function hackPushState(): void {
  window.history.pushState = function(state: any, title: string, url?: string | URL | null) {
    const result = originalPushState.call(this, state, title, url);
    triggerRouteChange(window.location);
    return result;
  };
}

/**
 * 重写 replaceState
 */
function hackReplaceState(): void {
  window.history.replaceState = function(state: any, title: string, url?: string | URL | null) {
    const result = originalReplaceState.call(this, state, title, url);
    triggerRouteChange(window.location);
    return result;
  };
}

/**
 * 监听 popstate 事件（浏览器前进后退）
 */
function listenPopState(): void {
  window.addEventListener('popstate', () => {
    triggerRouteChange(window.location);
  });
}

/**
 * 监听 hashchange 事件
 */
function listenHashChange(): void {
  window.addEventListener('hashchange', () => {
    triggerRouteChange(window.location);
  });
}

/**
 * 添加路由变化监听器
 */
export function addRouteChangeListener(listener: RouteChangeListener): () => void {
  routeChangeListeners.push(listener);
  
  // 返回取消监听函数
  return () => {
    const index = routeChangeListeners.indexOf(listener);
    if (index > -1) {
      routeChangeListeners.splice(index, 1);
    }
  };
}

/**
 * 执行应用调度
 */
async function reroute(): Promise<void> {
  // 获取需要加载的应用
  const appsToLoad = getAppsToLoad();
  
  // 获取需要卸载的应用
  const appsToUnmount = getAppsToUnmount();
  
  // 获取需要挂载的应用
  const appsToMount = getAppsToMount();

  // 1. 卸载应用
  await Promise.all(appsToUnmount.map(app => unmountApp(app)));

  // 2. 加载应用
  await Promise.all(appsToLoad.map(app => loadApp(app)));

  // 3. 启动应用
  await Promise.all(appsToMount.map(app => {
    return bootstrapApp(app).then(() => mountApp(app));
  }));
}

/**
 * 导航到指定路径
 */
export function navigateTo(url: string): void {
  window.history.pushState(null, '', url);
  triggerRouteChange(window.location);
}

/**
 * 启动微前端框架
 */
export function start(): void {
  if (isStarted) {
    console.warn('微前端框架已经启动');
    return;
  }

  // 劫持路由方法
  hackPushState();
  hackReplaceState();
  
  // 监听路由事件
  listenPopState();
  listenHashChange();

  // 添加路由变化监听器
  addRouteChangeListener(() => {
    reroute();
  });

  isStarted = true;

  // 初次执行调度
  reroute();
}

/**
 * 获取当前路由信息
 */
export function getCurrentRoute() {
  return {
    path: window.location.pathname,
    hash: window.location.hash,
    query: Object.fromEntries(new URLSearchParams(window.location.search))
  };
}

/**
 * 路由守卫
 */
type RouteGuard = (to: Location, from: Location) => boolean | Promise<boolean>;
const routeGuards: RouteGuard[] = [];

/**
 * 添加路由守卫
 */
export function addRouteGuard(guard: RouteGuard): () => void {
  routeGuards.push(guard);
  
  return () => {
    const index = routeGuards.indexOf(guard);
    if (index > -1) {
      routeGuards.splice(index, 1);
    }
  };
}

/**
 * 执行路由守卫
 */
async function runRouteGuards(to: Location, from: Location): Promise<boolean> {
  for (const guard of routeGuards) {
    try {
      const result = await guard(to, from);
      if (result === false) {
        return false;
      }
    } catch (error) {
      console.error('路由守卫执行错误:', error);
      return false;
    }
  }
  return true;
}

/**
 * 预加载指定路由的应用
 */
export async function prefetchApps(path: string): Promise<void> {
  const originalPath = window.location.pathname;
  
  // 临时修改路径来获取应该加载的应用
  window.history.replaceState(null, '', path);
  const appsToLoad = getAppsToLoad();
  
  // 恢复原路径
  window.history.replaceState(null, '', originalPath);

  // 预加载应用
  await Promise.all(appsToLoad.map(app => {
    if (typeof app.entry === 'string') {
      const { prefetchApp } = require('./loader');
      return prefetchApp(app.entry);
    }
    return Promise.resolve();
  }));
}

/**
 * 微前端框架主入口
 */

// 导出类型
export * from './types';

// 导出应用管理
export {
  registerMicroApps,
  getApps,
  getApp,
  loadApp,
  bootstrapApp,
  mountApp,
  unmountApp,
  updateApp,
  unloadApp
} from './application';

// 导出路由
export {
  start,
  navigateTo,
  getCurrentRoute,
  addRouteChangeListener,
  addRouteGuard,
  prefetchApps
} from './router';

// 导出沙箱
export {
  SnapshotSandbox,
  ProxySandbox,
  SandboxType,
  createSandbox
} from './sandbox';

// 导出样式隔离
export {
  StyleIsolationType,
  StyleIsolationManager,
  createShadowContainer,
  applyScopedStyles,
  applyShadowStyles
} from './style-isolation';

// 导出事件通信
export {
  EventBus,
  globalEventBus,
  GlobalState,
  globalState,
  actions
} from './event-bus';

// 导出加载器
export {
  loadAppEntry,
  prefetchApp
} from './loader';

// 导出工具函数
export * from './utils';

/**
 * 版本号
 */
export const version = '1.0.0';

/**
 * 默认导出
 */
export default {
  version,
  registerMicroApps,
  start,
  navigateTo
};

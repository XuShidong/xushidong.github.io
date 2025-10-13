/**
 * 微前端应用状态
 */
export enum AppStatus {
  NOT_LOADED = 'NOT_LOADED',      // 未加载
  LOADING = 'LOADING',            // 加载中
  NOT_BOOTSTRAPPED = 'NOT_BOOTSTRAPPED', // 未启动
  BOOTSTRAPPING = 'BOOTSTRAPPING', // 启动中
  NOT_MOUNTED = 'NOT_MOUNTED',    // 未挂载
  MOUNTING = 'MOUNTING',          // 挂载中
  MOUNTED = 'MOUNTED',            // 已挂载
  UNMOUNTING = 'UNMOUNTING',      // 卸载中
  UNLOADING = 'UNLOADING',        // 移除中
  LOAD_ERROR = 'LOAD_ERROR',      // 加载失败
  SKIP_BECAUSE_BROKEN = 'SKIP_BECAUSE_BROKEN' // 已损坏
}

/**
 * 应用生命周期函数
 */
export interface LifeCycles<T = any> {
  bootstrap: (props?: T) => Promise<any>;
  mount: (props?: T) => Promise<any>;
  unmount: (props?: T) => Promise<any>;
  update?: (props?: T) => Promise<any>;
}

/**
 * 应用配置
 */
export interface AppConfig {
  name: string;                    // 应用名称
  entry: string | { scripts?: string[]; styles?: string[]; html?: string }; // 入口
  container: string | HTMLElement; // 容器
  activeRule: string | ((location: Location) => boolean); // 激活规则
  props?: Record<string, any>;     // 传递给应用的属性
  loader?: (loading: boolean) => void; // 加载状态回调
}

/**
 * 应用实例
 */
export interface App extends AppConfig {
  status: AppStatus;
  loadPromise?: Promise<void>;
  bootstrapPromise?: Promise<void>;
  mountPromise?: Promise<void>;
  unmountPromise?: Promise<void>;
  lifeCycles?: LifeCycles;
  scripts?: HTMLScriptElement[];
  styles?: HTMLLinkElement[];
  sandbox?: Sandbox;
}

/**
 * 沙箱接口
 */
export interface Sandbox {
  active(): void;
  inactive(): void;
  destroy(): void;
}

/**
 * 加载器选项
 */
export interface LoaderOptions {
  fetch?: typeof window.fetch;
  getPublicPath?: (entry: string) => string;
  getTemplate?: (tpl: string) => string;
}

/**
 * 事件总线事件
 */
export interface EventPayload {
  type: string;
  data?: any;
  from?: string;
  to?: string;
}

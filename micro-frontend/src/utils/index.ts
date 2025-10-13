/**
 * 工具函数
 */

/**
 * 判断是否为函数
 */
export function isFunction(fn: any): fn is Function {
  return typeof fn === 'function';
}

/**
 * 判断是否为Promise
 */
export function isPromise(obj: any): obj is Promise<any> {
  return !!obj && (typeof obj === 'object' || isFunction(obj)) && isFunction(obj.then);
}

/**
 * 确保返回Promise
 */
export function toPromise<T>(maybePromise: T | Promise<T>): Promise<T> {
  return isPromise(maybePromise) ? maybePromise : Promise.resolve(maybePromise);
}

/**
 * 获取容器元素
 */
export function getContainer(container: string | HTMLElement): HTMLElement | null {
  if (typeof container === 'string') {
    return document.querySelector(container);
  }
  return container;
}

/**
 * 路径匹配
 */
export function pathToRegexp(path: string): RegExp {
  // 简化版路径匹配，支持基本的通配符
  const pattern = path
    .replace(/\//g, '\\/')
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.');
  return new RegExp(`^${pattern}$`);
}

/**
 * 执行脚本
 */
export function execScripts(entry: string, scripts: string[], proxy = window): Promise<any> {
  return scripts.reduce((chain, script) => {
    return chain.then(() => {
      const scriptEl = document.createElement('script');
      scriptEl.text = script;
      return new Promise((resolve, reject) => {
        try {
          // 使用沙箱的全局对象执行脚本
          const exports = {};
          const module = { exports };
          const func = new Function('window', 'self', 'globalThis', 'exports', 'module', script);
          func.call(proxy, proxy, proxy, proxy, exports, module);
          resolve(module.exports);
        } catch (error) {
          reject(error);
        }
      });
    });
  }, Promise.resolve());
}

/**
 * 获取域名
 */
export function getHostFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.origin;
  } catch {
    return '';
  }
}

/**
 * 补全URL
 */
export function resolveUrl(base: string, relative: string): string {
  try {
    return new URL(relative, base).href;
  } catch {
    return relative;
  }
}

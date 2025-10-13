/**
 * 代理沙箱
 * 使用Proxy实现的沙箱，支持多实例
 * 推荐使用
 */

import { Sandbox } from '../types';

// 需要特殊处理的window属性
const SPECIAL_PROPERTIES = ['top', 'parent', 'window', 'self', 'globalThis'];

// 不可配置的属性
const unscopables = {
  undefined: true,
  Array: true,
  Object: true,
  String: true,
  Boolean: true,
  Math: true,
  Number: true,
  Symbol: true,
  parseFloat: true,
  Float32Array: true
};

/**
 * 判断属性是否在原型链上
 */
function hasOwnProperty(obj: any, key: PropertyKey): boolean {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

export class ProxySandbox implements Sandbox {
  private proxy: Window;
  private sandboxRunning = false;
  private addedPropsMap = new Map<PropertyKey, any>();
  private modifiedPropsMap = new Map<PropertyKey, any>();
  private currentUpdatedPropsValueMap = new Map<PropertyKey, any>();

  constructor(private name: string) {
    const fakeWindow = Object.create(null) as Window;
    
    const proxy = new Proxy(fakeWindow, {
      get: (target: any, prop: PropertyKey): any => {
        // 特殊属性返回proxy自身
        if (SPECIAL_PROPERTIES.includes(prop as string)) {
          return proxy;
        }

        // 优先从代理对象取值
        if (hasOwnProperty(target, prop)) {
          return target[prop];
        }

        // 从window取值
        const value = (window as any)[prop];

        // 如果是函数，绑定window作为this
        if (typeof value === 'function' && !unscopables[prop as any]) {
          const boundValue = value.bind(window);
          // 保留原函数的属性
          for (const key in value) {
            boundValue[key] = value[key];
          }
          return boundValue;
        }

        return value;
      },

      set: (target: any, prop: PropertyKey, value: any): boolean => {
        if (!this.sandboxRunning) {
          console.warn(`[${this.name}] 沙箱未激活，禁止修改window属性`);
          return true;
        }

        // 记录变更
        if (!hasOwnProperty(target, prop)) {
          this.addedPropsMap.set(prop, value);
        } else if (!this.modifiedPropsMap.has(prop)) {
          this.modifiedPropsMap.set(prop, (window as any)[prop]);
        }

        this.currentUpdatedPropsValueMap.set(prop, value);
        target[prop] = value;

        return true;
      },

      has: (target: any, prop: PropertyKey): boolean => {
        return prop in target || prop in window;
      },

      deleteProperty: (target: any, prop: PropertyKey): boolean => {
        if (hasOwnProperty(target, prop)) {
          delete target[prop];
          this.currentUpdatedPropsValueMap.delete(prop);
        }
        return true;
      }
    });

    this.proxy = proxy;
  }

  /**
   * 获取代理对象
   */
  getProxy(): Window {
    return this.proxy;
  }

  /**
   * 激活沙箱
   */
  active(): void {
    if (this.sandboxRunning) {
      return;
    }

    // 恢复变更
    this.currentUpdatedPropsValueMap.forEach((value, prop) => {
      (this.proxy as any)[prop] = value;
    });

    this.sandboxRunning = true;
  }

  /**
   * 停用沙箱
   */
  inactive(): void {
    if (!this.sandboxRunning) {
      return;
    }

    this.sandboxRunning = false;
  }

  /**
   * 销毁沙箱
   */
  destroy(): void {
    this.inactive();
    this.addedPropsMap.clear();
    this.modifiedPropsMap.clear();
    this.currentUpdatedPropsValueMap.clear();
  }
}

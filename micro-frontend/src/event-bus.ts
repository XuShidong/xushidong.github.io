/**
 * 事件总线 - 应用间通信机制
 * 提供发布订阅模式的事件通信
 */

import { EventPayload } from './types';

type EventHandler = (payload: EventPayload) => void;

/**
 * 事件总线类
 */
class EventBus {
  private events: Map<string, Set<EventHandler>> = new Map();
  private onceEvents: Map<string, Set<EventHandler>> = new Map();
  private history: EventPayload[] = [];
  private maxHistory = 50; // 最多保存50条历史记录

  /**
   * 订阅事件
   */
  on(eventType: string, handler: EventHandler): () => void {
    if (!this.events.has(eventType)) {
      this.events.set(eventType, new Set());
    }
    
    this.events.get(eventType)!.add(handler);

    // 返回取消订阅函数
    return () => this.off(eventType, handler);
  }

  /**
   * 订阅一次性事件
   */
  once(eventType: string, handler: EventHandler): () => void {
    if (!this.onceEvents.has(eventType)) {
      this.onceEvents.set(eventType, new Set());
    }
    
    this.onceEvents.get(eventType)!.add(handler);

    // 返回取消订阅函数
    return () => {
      const handlers = this.onceEvents.get(eventType);
      if (handlers) {
        handlers.delete(handler);
      }
    };
  }

  /**
   * 取消订阅
   */
  off(eventType: string, handler?: EventHandler): void {
    if (!handler) {
      // 移除该类型的所有监听器
      this.events.delete(eventType);
      this.onceEvents.delete(eventType);
      return;
    }

    // 移除指定监听器
    const handlers = this.events.get(eventType);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.events.delete(eventType);
      }
    }

    const onceHandlers = this.onceEvents.get(eventType);
    if (onceHandlers) {
      onceHandlers.delete(handler);
      if (onceHandlers.size === 0) {
        this.onceEvents.delete(eventType);
      }
    }
  }

  /**
   * 发送事件
   */
  emit(eventType: string, data?: any, from?: string, to?: string): void {
    const payload: EventPayload = {
      type: eventType,
      data,
      from,
      to
    };

    // 保存到历史记录
    this.addToHistory(payload);

    // 触发普通监听器
    const handlers = this.events.get(eventType);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          // 如果指定了接收者，检查是否匹配
          if (!to || !from) {
            handler(payload);
          }
        } catch (error) {
          console.error(`事件处理器执行错误 [${eventType}]:`, error);
        }
      });
    }

    // 触发一次性监听器
    const onceHandlers = this.onceEvents.get(eventType);
    if (onceHandlers) {
      const handlersArray = Array.from(onceHandlers);
      onceHandlers.clear(); // 清空一次性监听器
      
      handlersArray.forEach(handler => {
        try {
          if (!to || !from) {
            handler(payload);
          }
        } catch (error) {
          console.error(`一次性事件处理器执行错误 [${eventType}]:`, error);
        }
      });
    }
  }

  /**
   * 添加到历史记录
   */
  private addToHistory(payload: EventPayload): void {
    this.history.push(payload);
    
    // 限制历史记录数量
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
  }

  /**
   * 获取历史记录
   */
  getHistory(eventType?: string): EventPayload[] {
    if (eventType) {
      return this.history.filter(item => item.type === eventType);
    }
    return [...this.history];
  }

  /**
   * 清空历史记录
   */
  clearHistory(): void {
    this.history = [];
  }

  /**
   * 清空所有监听器
   */
  clear(): void {
    this.events.clear();
    this.onceEvents.clear();
  }

  /**
   * 获取所有事件类型
   */
  getEventTypes(): string[] {
    return Array.from(new Set([
      ...this.events.keys(),
      ...this.onceEvents.keys()
    ]));
  }

  /**
   * 获取指定事件的监听器数量
   */
  getListenerCount(eventType: string): number {
    const normalCount = this.events.get(eventType)?.size || 0;
    const onceCount = this.onceEvents.get(eventType)?.size || 0;
    return normalCount + onceCount;
  }
}

// 创建全局事件总线实例
const globalEventBus = new EventBus();

export { EventBus, globalEventBus };

/**
 * 全局状态管理
 */
class GlobalState {
  private state: Map<string, any> = new Map();
  private listeners: Map<string, Set<(value: any) => void>> = new Map();

  /**
   * 设置状态
   */
  set(key: string, value: any): void {
    const oldValue = this.state.get(key);
    this.state.set(key, value);

    // 触发监听器
    const keyListeners = this.listeners.get(key);
    if (keyListeners) {
      keyListeners.forEach(listener => {
        try {
          listener(value);
        } catch (error) {
          console.error(`状态监听器执行错误 [${key}]:`, error);
        }
      });
    }

    // 触发全局事件
    globalEventBus.emit('globalState:change', { key, value, oldValue });
  }

  /**
   * 获取状态
   */
  get<T = any>(key: string): T | undefined {
    return this.state.get(key);
  }

  /**
   * 监听状态变化
   */
  watch(key: string, listener: (value: any) => void): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }

    this.listeners.get(key)!.add(listener);

    // 返回取消监听函数
    return () => {
      const keyListeners = this.listeners.get(key);
      if (keyListeners) {
        keyListeners.delete(listener);
        if (keyListeners.size === 0) {
          this.listeners.delete(key);
        }
      }
    };
  }

  /**
   * 删除状态
   */
  delete(key: string): boolean {
    const result = this.state.delete(key);
    this.listeners.delete(key);
    
    if (result) {
      globalEventBus.emit('globalState:delete', { key });
    }
    
    return result;
  }

  /**
   * 清空状态
   */
  clear(): void {
    this.state.clear();
    this.listeners.clear();
    globalEventBus.emit('globalState:clear', {});
  }

  /**
   * 获取所有状态键
   */
  keys(): string[] {
    return Array.from(this.state.keys());
  }

  /**
   * 获取所有状态
   */
  getAll(): Record<string, any> {
    const result: Record<string, any> = {};
    this.state.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }
}

// 创建全局状态管理实例
const globalState = new GlobalState();

export { GlobalState, globalState };

/**
 * 便捷的通信API
 */
export const actions = {
  /**
   * 发送消息到指定应用
   */
  sendTo(appName: string, eventType: string, data?: any): void {
    globalEventBus.emit(`app:${appName}:${eventType}`, data, 'system', appName);
  },

  /**
   * 监听来自指定应用的消息
   */
  onFrom(appName: string, eventType: string, handler: (data: any) => void): () => void {
    return globalEventBus.on(`app:${appName}:${eventType}`, (payload) => {
      handler(payload.data);
    });
  },

  /**
   * 广播消息到所有应用
   */
  broadcast(eventType: string, data?: any): void {
    globalEventBus.emit(`broadcast:${eventType}`, data);
  },

  /**
   * 监听广播消息
   */
  onBroadcast(eventType: string, handler: (data: any) => void): () => void {
    return globalEventBus.on(`broadcast:${eventType}`, (payload) => {
      handler(payload.data);
    });
  }
};

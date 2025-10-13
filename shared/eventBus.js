/**
 * 微前端应用间通信事件总线
 * 基于发布-订阅模式实现应用间的解耦通信
 */
class EventBus {
  constructor() {
    this.events = {};
  }

  /**
   * 订阅事件
   * @param {string} eventName 事件名称
   * @param {function} callback 回调函数
   * @returns {function} 取消订阅函数
   */
  on(eventName, callback) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(callback);

    // 返回取消订阅函数
    return () => {
      this.off(eventName, callback);
    };
  }

  /**
   * 取消订阅事件
   * @param {string} eventName 事件名称
   * @param {function} callback 回调函数
   */
  off(eventName, callback) {
    if (!this.events[eventName]) return;
    
    this.events[eventName] = this.events[eventName].filter(cb => cb !== callback);
    
    // 如果没有监听器了，删除该事件
    if (this.events[eventName].length === 0) {
      delete this.events[eventName];
    }
  }

  /**
   * 发布事件
   * @param {string} eventName 事件名称
   * @param {any} data 事件数据
   */
  emit(eventName, data) {
    if (!this.events[eventName]) return;
    
    this.events[eventName].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener for ${eventName}:`, error);
      }
    });
  }

  /**
   * 一次性订阅事件
   * @param {string} eventName 事件名称
   * @param {function} callback 回调函数
   */
  once(eventName, callback) {
    const onceCallback = (data) => {
      callback(data);
      this.off(eventName, onceCallback);
    };
    this.on(eventName, onceCallback);
  }

  /**
   * 清除所有事件监听器
   */
  clear() {
    this.events = {};
  }

  /**
   * 获取所有事件名称
   * @returns {string[]} 事件名称数组
   */
  getEventNames() {
    return Object.keys(this.events);
  }

  /**
   * 获取指定事件的监听器数量
   * @param {string} eventName 事件名称
   * @returns {number} 监听器数量
   */
  getListenerCount(eventName) {
    return this.events[eventName] ? this.events[eventName].length : 0;
  }
}

// 创建全局事件总线实例
const eventBus = new EventBus();

// 定义常用的事件类型
export const EVENT_TYPES = {
  USER_LOGIN: 'user:login',
  USER_LOGOUT: 'user:logout',
  USER_UPDATE: 'user:update',
  NAVIGATION: 'navigation:change',
  THEME_CHANGE: 'theme:change',
  NOTIFICATION: 'notification:show',
  DATA_REFRESH: 'data:refresh',
  MODAL_OPEN: 'modal:open',
  MODAL_CLOSE: 'modal:close',
};

// 导出事件总线实例和类型
export default eventBus;
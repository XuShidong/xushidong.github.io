/**
 * 快照沙箱
 * 通过快照记录window对象的变化
 * 适用于单实例场景
 */

import { Sandbox } from '../types';

export class SnapshotSandbox implements Sandbox {
  private windowSnapshot: Record<string, any> = {};
  private modifyPropsMap: Record<string, any> = {};
  private sandboxRunning = false;

  constructor(private name: string) {}

  /**
   * 激活沙箱
   */
  active(): void {
    if (this.sandboxRunning) {
      return;
    }

    // 记录当前window状态
    this.windowSnapshot = {};
    for (const prop in window) {
      this.windowSnapshot[prop] = (window as any)[prop];
    }

    // 恢复之前的变更
    Object.keys(this.modifyPropsMap).forEach(prop => {
      (window as any)[prop] = this.modifyPropsMap[prop];
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

    // 记录变更
    this.modifyPropsMap = {};
    for (const prop in window) {
      if ((window as any)[prop] !== this.windowSnapshot[prop]) {
        this.modifyPropsMap[prop] = (window as any)[prop];
        // 还原window
        (window as any)[prop] = this.windowSnapshot[prop];
      }
    }

    this.sandboxRunning = false;
  }

  /**
   * 销毁沙箱
   */
  destroy(): void {
    this.inactive();
    this.windowSnapshot = {};
    this.modifyPropsMap = {};
  }
}

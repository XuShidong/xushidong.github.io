/**
 * 沙箱模块导出
 */

export { SnapshotSandbox } from './snapshot';
export { ProxySandbox } from './proxy';

import { Sandbox } from '../types';
import { ProxySandbox } from './proxy';
import { SnapshotSandbox } from './snapshot';

/**
 * 沙箱类型
 */
export enum SandboxType {
  Proxy = 'proxy',
  Snapshot = 'snapshot'
}

/**
 * 创建沙箱
 */
export function createSandbox(name: string, type: SandboxType = SandboxType.Proxy): Sandbox {
  if (type === SandboxType.Snapshot) {
    return new SnapshotSandbox(name);
  }
  
  // 检查浏览器是否支持Proxy
  if (typeof Proxy === 'undefined') {
    console.warn('浏览器不支持Proxy，降级使用快照沙箱');
    return new SnapshotSandbox(name);
  }

  return new ProxySandbox(name);
}

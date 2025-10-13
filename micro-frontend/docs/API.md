# API 文档

## 核心 API

### registerMicroApps(apps: AppConfig[])

注册一个或多个微应用。

**参数:**

- `apps` - 应用配置数组

**AppConfig 接口:**

```typescript
interface AppConfig {
  name: string;                    // 应用唯一名称
  entry: string | {                // 应用入口
    scripts?: string[];            // JS 文件列表
    styles?: string[];             // CSS 文件列表
    html?: string;                 // HTML 内容
  };
  container: string | HTMLElement; // 容器选择器或元素
  activeRule: string | ((location: Location) => boolean); // 激活规则
  props?: Record<string, any>;     // 传递给应用的属性
  loader?: (loading: boolean) => void; // 加载状态回调
}
```

**示例:**

```typescript
import { registerMicroApps } from '@micro-frontend/core';

registerMicroApps([
  {
    name: 'app1',
    entry: 'http://localhost:3001',
    container: '#container',
    activeRule: '/app1',
    props: { basePath: '/app1' },
    loader: (loading) => {
      console.log('加载中:', loading);
    }
  }
]);
```

---

### start()

启动微前端框架。

**示例:**

```typescript
import { start } from '@micro-frontend/core';

start();
```

---

### navigateTo(url: string)

编程式导航到指定路径。

**参数:**

- `url` - 目标路径

**示例:**

```typescript
import { navigateTo } from '@micro-frontend/core';

navigateTo('/app1/page');
```

---

### getApps()

获取所有已注册的应用。

**返回值:** `App[]`

**示例:**

```typescript
import { getApps } from '@micro-frontend/core';

const apps = getApps();
console.log('已注册应用:', apps);
```

---

### getApp(name: string)

获取指定名称的应用。

**参数:**

- `name` - 应用名称

**返回值:** `App | undefined`

**示例:**

```typescript
import { getApp } from '@micro-frontend/core';

const app = getApp('app1');
if (app) {
  console.log('应用状态:', app.status);
}
```

---

### loadApp(app: App)

手动加载应用。

**参数:**

- `app` - 应用实例

**示例:**

```typescript
import { getApp, loadApp } from '@micro-frontend/core';

const app = getApp('app1');
if (app) {
  await loadApp(app);
}
```

---

### mountApp(app: App)

手动挂载应用。

**参数:**

- `app` - 应用实例

**示例:**

```typescript
import { getApp, mountApp } from '@micro-frontend/core';

const app = getApp('app1');
if (app) {
  await mountApp(app);
}
```

---

### unmountApp(app: App)

手动卸载应用。

**参数:**

- `app` - 应用实例

**示例:**

```typescript
import { getApp, unmountApp } from '@micro-frontend/core';

const app = getApp('app1');
if (app) {
  await unmountApp(app);
}
```

---

### updateApp(app: App, props: Record<string, any>)

更新应用的 props。

**参数:**

- `app` - 应用实例
- `props` - 新的属性

**示例:**

```typescript
import { getApp, updateApp } from '@micro-frontend/core';

const app = getApp('app1');
if (app) {
  await updateApp(app, { theme: 'dark' });
}
```

---

### unloadApp(name: string)

卸载并移除应用。

**参数:**

- `name` - 应用名称

**示例:**

```typescript
import { unloadApp } from '@micro-frontend/core';

await unloadApp('app1');
```

---

## 路由 API

### addRouteChangeListener(listener)

添加路由变化监听器。

**参数:**

- `listener: (location: Location) => void` - 监听器函数

**返回值:** 取消监听函数

**示例:**

```typescript
import { addRouteChangeListener } from '@micro-frontend/core';

const unlisten = addRouteChangeListener((location) => {
  console.log('路由变化:', location.pathname);
});

// 取消监听
unlisten();
```

---

### addRouteGuard(guard)

添加路由守卫。

**参数:**

- `guard: (to: Location, from: Location) => boolean | Promise<boolean>` - 守卫函数

**返回值:** 取消守卫函数

**示例:**

```typescript
import { addRouteGuard } from '@micro-frontend/core';

const removeGuard = addRouteGuard((to, from) => {
  if (!isAuthenticated() && to.pathname.startsWith('/admin')) {
    return false; // 阻止导航
  }
  return true; // 允许导航
});

// 移除守卫
removeGuard();
```

---

### getCurrentRoute()

获取当前路由信息。

**返回值:**

```typescript
{
  path: string;
  hash: string;
  query: Record<string, string>;
}
```

**示例:**

```typescript
import { getCurrentRoute } from '@micro-frontend/core';

const route = getCurrentRoute();
console.log('当前路径:', route.path);
console.log('查询参数:', route.query);
```

---

### prefetchApps(path: string)

预加载指定路径的应用。

**参数:**

- `path` - 路径

**示例:**

```typescript
import { prefetchApps } from '@micro-frontend/core';

// 预加载
await prefetchApps('/app1');
```

---

## 沙箱 API

### createSandbox(name, type?)

创建沙箱实例。

**参数:**

- `name: string` - 沙箱名称
- `type?: SandboxType` - 沙箱类型（默认：Proxy）

**返回值:** `Sandbox`

**示例:**

```typescript
import { createSandbox, SandboxType } from '@micro-frontend/core';

// 创建 Proxy 沙箱
const sandbox = createSandbox('app1', SandboxType.Proxy);

// 创建快照沙箱
const snapshotSandbox = createSandbox('app2', SandboxType.Snapshot);

// 激活沙箱
sandbox.active();

// 停用沙箱
sandbox.inactive();

// 销毁沙箱
sandbox.destroy();
```

---

## 样式隔离 API

### StyleIsolationManager

样式隔离管理器。

**构造函数:**

```typescript
new StyleIsolationManager(appName: string, type?: StyleIsolationType)
```

**方法:**

- `applyStyles(container, styles)` - 应用样式
- `getRenderContainer(container)` - 获取渲染容器
- `cleanup(container)` - 清理样式

**示例:**

```typescript
import { StyleIsolationManager, StyleIsolationType } from '@micro-frontend/core';

const styleManager = new StyleIsolationManager('app1', StyleIsolationType.Scoped);

// 应用样式
styleManager.applyStyles(container, ['.app { color: red; }']);

// 获取渲染容器
const renderContainer = styleManager.getRenderContainer(container);

// 清理样式
styleManager.cleanup(container);
```

---

## 通信 API

### EventBus

事件总线实例。

**方法:**

- `on(type, handler)` - 订阅事件
- `once(type, handler)` - 订阅一次性事件
- `off(type, handler?)` - 取消订阅
- `emit(type, data?, from?, to?)` - 发送事件
- `getHistory(type?)` - 获取历史记录
- `clearHistory()` - 清空历史
- `clear()` - 清空所有监听器

**示例:**

```typescript
import { globalEventBus } from '@micro-frontend/core';

// 订阅事件
const unsubscribe = globalEventBus.on('custom-event', (payload) => {
  console.log('接收到事件:', payload);
});

// 发送事件
globalEventBus.emit('custom-event', { message: 'Hello' });

// 一次性订阅
globalEventBus.once('init', (payload) => {
  console.log('初始化完成');
});

// 取消订阅
unsubscribe();
```

---

### GlobalState

全局状态管理。

**方法:**

- `set(key, value)` - 设置状态
- `get(key)` - 获取状态
- `watch(key, listener)` - 监听状态
- `delete(key)` - 删除状态
- `clear()` - 清空状态
- `keys()` - 获取所有键
- `getAll()` - 获取所有状态

**示例:**

```typescript
import { globalState } from '@micro-frontend/core';

// 设置状态
globalState.set('user', { name: 'John', age: 30 });

// 获取状态
const user = globalState.get('user');

// 监听状态
const unwatch = globalState.watch('user', (value) => {
  console.log('用户信息更新:', value);
});

// 删除状态
globalState.delete('user');

// 取消监听
unwatch();
```

---

### Actions

便捷通信 API。

**方法:**

- `sendTo(appName, eventType, data?)` - 发送消息到指定应用
- `onFrom(appName, eventType, handler)` - 监听来自指定应用的消息
- `broadcast(eventType, data?)` - 广播消息
- `onBroadcast(eventType, handler)` - 监听广播消息

**示例:**

```typescript
import { actions } from '@micro-frontend/core';

// 发送到指定应用
actions.sendTo('app1', 'message', { text: 'Hello' });

// 监听来自指定应用
const unlisten = actions.onFrom('app1', 'message', (data) => {
  console.log('收到消息:', data);
});

// 广播
actions.broadcast('notification', { title: '新消息' });

// 监听广播
actions.onBroadcast('notification', (data) => {
  console.log('收到广播:', data);
});
```

---

## 类型定义

### AppStatus

应用状态枚举。

```typescript
enum AppStatus {
  NOT_LOADED = 'NOT_LOADED',
  LOADING = 'LOADING',
  NOT_BOOTSTRAPPED = 'NOT_BOOTSTRAPPED',
  BOOTSTRAPPING = 'BOOTSTRAPPING',
  NOT_MOUNTED = 'NOT_MOUNTED',
  MOUNTING = 'MOUNTING',
  MOUNTED = 'MOUNTED',
  UNMOUNTING = 'UNMOUNTING',
  UNLOADING = 'UNLOADING',
  LOAD_ERROR = 'LOAD_ERROR',
  SKIP_BECAUSE_BROKEN = 'SKIP_BECAUSE_BROKEN'
}
```

---

### LifeCycles

生命周期接口。

```typescript
interface LifeCycles<T = any> {
  bootstrap: (props?: T) => Promise<any>;
  mount: (props?: T) => Promise<any>;
  unmount: (props?: T) => Promise<any>;
  update?: (props?: T) => Promise<any>;
}
```

---

### SandboxType

沙箱类型枚举。

```typescript
enum SandboxType {
  Proxy = 'proxy',
  Snapshot = 'snapshot'
}
```

---

### StyleIsolationType

样式隔离类型枚举。

```typescript
enum StyleIsolationType {
  None = 'none',
  ShadowDOM = 'shadow',
  Scoped = 'scoped'
}
```

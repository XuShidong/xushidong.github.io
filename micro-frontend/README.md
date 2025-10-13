# 微前端框架

一个轻量级、高性能的微前端框架，支持多种应用隔离和通信方案。

## ✨ 特性

- 🚀 **轻量高效** - 核心代码小于 20KB（gzip）
- 🔒 **沙箱隔离** - 支持 Proxy 和 Snapshot 两种沙箱方案
- 🎨 **样式隔离** - 支持 Shadow DOM 和 Scoped CSS
- 🔄 **路由管理** - 自动劫持路由，支持路由守卫
- 📡 **应用通信** - 提供事件总线和全局状态管理
- 🎯 **生命周期** - 完整的应用生命周期管理
- 📦 **资源加载** - 智能加载 JavaScript、CSS、HTML
- 🔌 **预加载** - 支持应用预加载，提升性能

## 📦 安装

```bash
npm install @micro-frontend/core
```

## 🚀 快速开始

### 1. 注册微应用

```typescript
import { registerMicroApps, start } from '@micro-frontend/core';

// 注册微应用
registerMicroApps([
  {
    name: 'app1',
    entry: 'http://localhost:3001',
    container: '#app1-container',
    activeRule: '/app1'
  },
  {
    name: 'app2',
    entry: 'http://localhost:3002',
    container: '#app2-container',
    activeRule: '/app2'
  }
]);

// 启动框架
start();
```

### 2. 创建主应用 HTML

```html
<!DOCTYPE html>
<html>
<head>
  <title>微前端主应用</title>
</head>
<body>
  <nav>
    <a href="/app1">应用1</a>
    <a href="/app2">应用2</a>
  </nav>
  
  <div id="app1-container"></div>
  <div id="app2-container"></div>
  
  <script src="./main.js"></script>
</body>
</html>
```

### 3. 创建子应用

子应用需要导出生命周期函数：

```javascript
// 子应用入口文件
let app;

// 启动函数
export async function bootstrap(props) {
  console.log('应用启动', props);
}

// 挂载函数
export async function mount(props) {
  app = createApp();
  app.mount(props.container);
}

// 卸载函数
export async function unmount(props) {
  app.unmount();
}

// 更新函数（可选）
export async function update(props) {
  console.log('应用更新', props);
}

// 将生命周期挂载到全局
window.app1 = {
  bootstrap,
  mount,
  unmount,
  update
};
```

## 📖 核心 API

### registerMicroApps(apps)

注册微应用。

```typescript
registerMicroApps([
  {
    name: 'app1',              // 应用名称
    entry: 'http://...',       // 应用入口
    container: '#container',   // 容器选择器
    activeRule: '/app1',       // 激活规则
    props: { ... },            // 传递给应用的属性
    loader: (loading) => {}    // 加载状态回调
  }
]);
```

### start()

启动微前端框架，开始监听路由变化。

```typescript
start();
```

### navigateTo(url)

导航到指定路径。

```typescript
navigateTo('/app1/page');
```

### 沙箱隔离

框架提供两种沙箱方案：

```typescript
import { createSandbox, SandboxType } from '@micro-frontend/core';

// Proxy沙箱（推荐）
const sandbox = createSandbox('app1', SandboxType.Proxy);

// 快照沙箱
const sandbox = createSandbox('app1', SandboxType.Snapshot);

// 激活沙箱
sandbox.active();

// 停用沙箱
sandbox.inactive();

// 销毁沙箱
sandbox.destroy();
```

### 样式隔离

支持多种样式隔离方案：

```typescript
import { StyleIsolationManager, StyleIsolationType } from '@micro-frontend/core';

// 创建样式隔离管理器
const styleManager = new StyleIsolationManager('app1', StyleIsolationType.Scoped);

// 应用样式
styleManager.applyStyles(container, styles);

// 清理样式
styleManager.cleanup(container);
```

### 应用间通信

#### 事件总线

```typescript
import { globalEventBus } from '@micro-frontend/core';

// 订阅事件
const unsubscribe = globalEventBus.on('custom-event', (payload) => {
  console.log(payload.data);
});

// 发送事件
globalEventBus.emit('custom-event', { message: 'Hello' });

// 取消订阅
unsubscribe();
```

#### 全局状态

```typescript
import { globalState } from '@micro-frontend/core';

// 设置状态
globalState.set('user', { name: 'John' });

// 获取状态
const user = globalState.get('user');

// 监听状态变化
const unwatch = globalState.watch('user', (value) => {
  console.log('用户信息更新:', value);
});
```

#### 便捷通信 API

```typescript
import { actions } from '@micro-frontend/core';

// 发送消息到指定应用
actions.sendTo('app1', 'message', { text: 'Hello' });

// 监听来自指定应用的消息
actions.onFrom('app1', 'message', (data) => {
  console.log(data.text);
});

// 广播消息
actions.broadcast('notification', { text: 'New message' });

// 监听广播
actions.onBroadcast('notification', (data) => {
  console.log(data.text);
});
```

### 路由守卫

```typescript
import { addRouteGuard } from '@micro-frontend/core';

// 添加路由守卫
addRouteGuard((to, from) => {
  // 返回 false 阻止导航
  if (!isAuthenticated()) {
    return false;
  }
  return true;
});
```

### 预加载

```typescript
import { prefetchApps } from '@micro-frontend/core';

// 预加载指定路由的应用
await prefetchApps('/app1');
```

## 🔧 高级配置

### 应用配置对象格式

```typescript
{
  name: string;                    // 应用名称（必填）
  entry: string | {                // 入口（必填）
    scripts?: string[];            // JS文件列表
    styles?: string[];             // CSS文件列表
    html?: string;                 // HTML内容
  };
  container: string | HTMLElement; // 容器（必填）
  activeRule: string | ((location: Location) => boolean); // 激活规则（必填）
  props?: Record<string, any>;     // 传递给应用的属性
  loader?: (loading: boolean) => void; // 加载状态回调
}
```

### 生命周期

每个子应用需要导出以下生命周期函数：

- `bootstrap(props)` - 应用初始化，只调用一次
- `mount(props)` - 应用挂载，每次激活时调用
- `unmount(props)` - 应用卸载，每次失活时调用
- `update(props)` - 应用更新（可选）

## 📝 完整示例

查看 `examples` 目录获取完整的示例代码。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

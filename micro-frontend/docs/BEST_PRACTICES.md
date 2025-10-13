# 最佳实践

本文档提供微前端开发的最佳实践建议。

## 应用设计

### 1. 应用拆分原则

#### 按业务领域拆分

```
✅ 推荐
- user-center（用户中心）
- order-management（订单管理）
- product-catalog（商品目录）

❌ 不推荐
- page1, page2, page3
- module-a, module-b
```

#### 合理的应用粒度

- 太大：失去微前端的优势
- 太小：增加维护成本和通信复杂度
- 建议：按业务模块划分，每个应用 3-10 个页面

### 2. 路由设计

#### 使用命名空间

```javascript
// ✅ 推荐
registerMicroApps([
  { name: 'user', activeRule: '/user' },
  { name: 'order', activeRule: '/order' },
  { name: 'product', activeRule: '/product' }
]);

// ❌ 不推荐
registerMicroApps([
  { name: 'app1', activeRule: '/a' },
  { name: 'app2', activeRule: '/b' }
]);
```

#### 路由层级清晰

```
✅ 推荐
/user/profile
/user/settings
/order/list
/order/detail/:id

❌ 不推荐
/profile
/settings
/list
/detail
```

## 生命周期管理

### 1. 正确实现生命周期

```javascript
// ✅ 完整的生命周期实现
export async function bootstrap(props) {
  // 只执行一次的初始化
  console.log('应用初始化');
}

export async function mount(props) {
  // 挂载应用
  app = createApp();
  app.mount(props.container);
  
  // 设置全局监听器
  setupGlobalListeners();
}

export async function unmount(props) {
  // 清理资源
  app.unmount();
  
  // 移除监听器
  removeGlobalListeners();
  
  // 清除定时器
  clearAllTimers();
}

export async function update(props) {
  // 可选：处理 props 更新
  app.updateProps(props);
}
```

### 2. 资源清理

```javascript
// ✅ 正确的资源管理
let timers = [];
let listeners = [];

export async function mount() {
  // 保存定时器引用
  const timer = setInterval(() => {}, 1000);
  timers.push(timer);
  
  // 保存监听器引用
  const listener = () => {};
  window.addEventListener('resize', listener);
  listeners.push({ type: 'resize', listener });
}

export async function unmount() {
  // 清理定时器
  timers.forEach(timer => clearInterval(timer));
  timers = [];
  
  // 移除监听器
  listeners.forEach(({ type, listener }) => {
    window.removeEventListener(type, listener);
  });
  listeners = [];
}
```

## 样式管理

### 1. 使用样式隔离

```javascript
// ✅ 推荐使用 Scoped CSS
import { StyleIsolationManager, StyleIsolationType } from '@micro-frontend/core';

const styleManager = new StyleIsolationManager(
  'app-name',
  StyleIsolationType.Scoped
);
```

### 2. CSS 命名规范

```css
/* ✅ 使用 BEM 命名 */
.user-center__header { }
.user-center__header--active { }
.user-center__title { }

/* ✅ 使用应用前缀 */
.app-user .header { }
.app-user .content { }

/* ❌ 避免全局样式 */
.header { }
.content { }
```

### 3. 避免全局样式污染

```css
/* ❌ 不要直接修改全局标签 */
body {
  background: #fff;
}

h1 {
  font-size: 24px;
}

/* ✅ 使用类名 */
.app-container {
  background: #fff;
}

.app-title {
  font-size: 24px;
}
```

## 应用通信

### 1. 选择合适的通信方式

#### 事件总线 - 用于临时消息

```javascript
// ✅ 适合：用户操作、一次性通知
globalEventBus.emit('user-logout');
globalEventBus.emit('notification', { message: '操作成功' });
```

#### 全局状态 - 用于共享数据

```javascript
// ✅ 适合：用户信息、权限、主题等
globalState.set('user', { id: 123, name: 'John' });
globalState.set('theme', 'dark');
globalState.set('permissions', ['read', 'write']);
```

### 2. 解耦应用通信

```javascript
// ✅ 使用抽象的事件名
globalEventBus.emit('auth:login-success', userData);
globalEventBus.emit('cart:item-added', item);

// ❌ 避免硬编码应用名称
globalEventBus.emit('app1-did-something', data);
```

### 3. 清理通信监听

```javascript
// ✅ 记得取消订阅
let unsubscribe;

export async function mount() {
  unsubscribe = globalEventBus.on('custom-event', handler);
}

export async function unmount() {
  if (unsubscribe) {
    unsubscribe();
  }
}
```

## 性能优化

### 1. 应用预加载

```javascript
// ✅ 预加载可能访问的应用
import { prefetchApps } from '@micro-frontend/core';

// 在空闲时预加载
window.addEventListener('load', () => {
  setTimeout(() => {
    prefetchApps('/user');
    prefetchApps('/order');
  }, 3000);
});
```

### 2. 懒加载非关键资源

```javascript
// ✅ 延迟加载大型库
export async function mount() {
  // 只在需要时加载
  const Charts = await import('chart.js');
  renderChart(Charts);
}
```

### 3. 避免重复加载

```javascript
// ✅ 缓存已加载的模块
const moduleCache = new Map();

async function loadModule(name) {
  if (moduleCache.has(name)) {
    return moduleCache.get(name);
  }
  
  const module = await import(name);
  moduleCache.set(name, module);
  return module;
}
```

## 错误处理

### 1. 生命周期错误处理

```javascript
// ✅ 捕获并记录错误
export async function mount(props) {
  try {
    app = createApp();
    app.mount(props.container);
  } catch (error) {
    console.error('应用挂载失败:', error);
    // 上报错误
    reportError(error);
    // 显示友好提示
    showErrorMessage('应用加载失败，请刷新重试');
  }
}
```

### 2. 通信错误处理

```javascript
// ✅ 处理通信异常
globalEventBus.on('data-request', async (payload) => {
  try {
    const data = await fetchData(payload.data);
    globalEventBus.emit('data-response', { data });
  } catch (error) {
    console.error('数据获取失败:', error);
    globalEventBus.emit('data-error', { error: error.message });
  }
});
```

## 开发调试

### 1. 开发环境配置

```javascript
// ✅ 根据环境切换入口
const isDev = process.env.NODE_ENV === 'development';

registerMicroApps([
  {
    name: 'app1',
    entry: isDev 
      ? 'http://localhost:3001' 
      : 'https://app1.example.com',
    container: '#container',
    activeRule: '/app1'
  }
]);
```

### 2. 添加调试日志

```javascript
// ✅ 使用环境变量控制日志
const DEBUG = process.env.DEBUG === 'true';

function log(...args) {
  if (DEBUG) {
    console.log('[MicroApp]', ...args);
  }
}

export async function mount(props) {
  log('开始挂载应用', props);
  // ...
}
```

### 3. 开发者工具

```javascript
// ✅ 暴露调试接口（仅开发环境）
if (isDev) {
  window.__MICRO_APP_DEBUG__ = {
    getApps,
    getCurrentRoute,
    globalState,
    globalEventBus
  };
}
```

## 测试

### 1. 单元测试

```javascript
// ✅ 测试生命周期
import { mount, unmount } from './app';

describe('应用生命周期', () => {
  it('应该正确挂载', async () => {
    const container = document.createElement('div');
    await mount({ container });
    expect(container.innerHTML).toBeTruthy();
  });

  it('应该正确卸载', async () => {
    const container = document.createElement('div');
    await mount({ container });
    await unmount({ container });
    expect(container.innerHTML).toBe('');
  });
});
```

### 2. 集成测试

```javascript
// ✅ 测试应用通信
import { globalEventBus } from '@micro-frontend/core';

describe('应用通信', () => {
  it('应该能发送和接收消息', (done) => {
    globalEventBus.on('test-event', (payload) => {
      expect(payload.data).toBe('test');
      done();
    });

    globalEventBus.emit('test-event', 'test');
  });
});
```

## 部署

### 1. 版本管理

```javascript
// ✅ 使用版本号
registerMicroApps([
  {
    name: 'app1',
    entry: 'https://cdn.example.com/app1/v1.2.3/index.html',
    container: '#container',
    activeRule: '/app1'
  }
]);
```

### 2. CDN 配置

```javascript
// ✅ 使用 CDN 加速
const CDN_HOST = 'https://cdn.example.com';

registerMicroApps([
  {
    name: 'app1',
    entry: {
      scripts: [`${CDN_HOST}/app1/main.js`],
      styles: [`${CDN_HOST}/app1/style.css`]
    },
    container: '#container',
    activeRule: '/app1'
  }
]);
```

### 3. 灰度发布

```javascript
// ✅ 基于用户灰度
const isGrayUser = checkGrayUser(userId);
const version = isGrayUser ? 'v2.0.0' : 'v1.9.0';

registerMicroApps([
  {
    name: 'app1',
    entry: `https://cdn.example.com/app1/${version}/index.html`,
    container: '#container',
    activeRule: '/app1'
  }
]);
```

## 安全

### 1. XSS 防护

```javascript
// ✅ 清理用户输入
function sanitizeHTML(html) {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

// 渲染前清理
container.innerHTML = sanitizeHTML(userInput);
```

### 2. CORS 配置

```javascript
// ✅ 配置允许的来源
// 后端配置示例
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://main-app.example.com');
  res.header('Access-Control-Allow-Methods', 'GET, POST');
  next();
});
```

## 总结

- ✅ 合理拆分应用
- ✅ 正确实现生命周期
- ✅ 及时清理资源
- ✅ 使用样式隔离
- ✅ 选择合适的通信方式
- ✅ 注重性能优化
- ✅ 完善错误处理
- ✅ 做好测试和调试
- ✅ 关注安全问题

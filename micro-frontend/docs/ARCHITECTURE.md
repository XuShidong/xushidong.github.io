# 架构设计

本文档描述微前端框架的整体架构设计。

## 架构概览

```
┌─────────────────────────────────────────────────────────┐
│                      主应用 (Main App)                   │
│  ┌───────────────────────────────────────────────────┐  │
│  │          微前端框架核心 (Framework Core)           │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌──────────┐ │  │
│  │  │ 应用管理器   │  │  路由系统     │  │ 通信系统  │ │  │
│  │  └─────────────┘  └──────────────┘  └──────────┘ │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌──────────┐ │  │
│  │  │  沙箱系统   │  │  资源加载器   │  │ 样式隔离  │ │  │
│  │  └─────────────┘  └──────────────┘  └──────────┘ │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
   ┌────▼────┐         ┌────▼────┐        ┌────▼────┐
   │ 子应用 1 │         │ 子应用 2 │        │ 子应用 3 │
   │ (React) │         │  (Vue)  │        │(Vanilla)│
   └─────────┘         └─────────┘        └─────────┘
```

## 核心模块

### 1. 应用管理器 (Application Manager)

**职责：**
- 应用注册与配置管理
- 生命周期管理
- 应用状态维护

**核心文件：** `src/application.ts`

**主要功能：**

```typescript
// 应用注册
registerMicroApps(apps: AppConfig[])

// 生命周期管理
loadApp(app: App)       // 加载应用
bootstrapApp(app: App)  // 启动应用
mountApp(app: App)      // 挂载应用
unmountApp(app: App)    // 卸载应用
updateApp(app: App)     // 更新应用
unloadApp(name: string) // 移除应用
```

**状态流转：**

```
NOT_LOADED → LOADING → NOT_BOOTSTRAPPED 
    ↓
BOOTSTRAPPING → NOT_MOUNTED → MOUNTING → MOUNTED
    ↓                                        ↓
UNMOUNTING ← ─────────────────────────────────
    ↓
NOT_MOUNTED (循环)
```

### 2. 路由系统 (Router System)

**职责：**
- 劫持原生路由方法
- 监听路由变化
- 触发应用切换
- 路由守卫

**核心文件：** `src/router.ts`

**实现原理：**

```javascript
// 劫持 pushState
const originalPushState = window.history.pushState;
window.history.pushState = function(...args) {
  const result = originalPushState.apply(this, args);
  triggerRouteChange(); // 触发路由变化
  return result;
};

// 监听 popstate
window.addEventListener('popstate', () => {
  triggerRouteChange();
});
```

**路由匹配：**

```
URL: /user/profile

匹配规则：
- /user        ✅ 匹配（前缀匹配）
- /user/*      ✅ 匹配（通配符）
- /order       ❌ 不匹配
```

### 3. 沙箱系统 (Sandbox System)

**职责：**
- 隔离应用 JavaScript 执行环境
- 防止全局变量污染
- 支持多实例运行

**核心文件：**
- `src/sandbox/proxy.ts` - Proxy 沙箱（推荐）
- `src/sandbox/snapshot.ts` - 快照沙箱（降级）

#### Proxy 沙箱架构

```typescript
ProxySandbox
│
├── fakeWindow (代理对象)
│   └── Proxy Handler
│       ├── get  - 读取属性
│       ├── set  - 设置属性
│       ├── has  - 属性检查
│       └── deleteProperty - 删除属性
│
├── addedPropsMap - 新增属性记录
├── modifiedPropsMap - 修改属性记录
└── currentUpdatedPropsValueMap - 当前值记录
```

**工作流程：**

```
应用代码访问 window.xxx
    ↓
Proxy 拦截
    ↓
优先从 fakeWindow 获取
    ↓
如果不存在，从真实 window 获取
    ↓
返回值（函数需要绑定 this）
```

#### 快照沙箱架构

```typescript
SnapshotSandbox
│
├── windowSnapshot - window 快照
└── modifyPropsMap - 修改记录

激活流程：
1. 记录当前 window 状态（快照）
2. 恢复之前的修改

停用流程：
1. 对比 window 与快照，记录差异
2. 还原 window 到快照状态
```

### 4. 资源加载器 (Loader)

**职责：**
- 加载应用资源（HTML、CSS、JS）
- 解析应用入口
- 执行脚本并获取生命周期

**核心文件：** `src/loader.ts`

**加载流程：**

```
1. 获取入口
   ├── URL 入口 → fetch HTML
   └── 对象入口 → 直接使用

2. 解析资源
   ├── 提取 <script> 标签
   ├── 提取 <style> 和 <link> 标签
   └── 提取 HTML 内容

3. 加载资源
   ├── 并行加载所有 CSS
   ├── 串行加载所有 JS
   └── 渲染 HTML

4. 执行脚本
   ├── 创建执行环境
   ├── 在沙箱中执行
   └── 获取生命周期函数
```

**资源处理：**

```javascript
// HTML 模板
<script src="app.js"></script>        → 外部脚本
<script>console.log('hello')</script> → 内联脚本
<link rel="stylesheet" href="app.css"> → 外部样式
<style>.app{}</style>                 → 内联样式

// 转换为
{
  scripts: ['<script content>', 'http://xxx/app.js'],
  styles: ['.app{}', 'http://xxx/app.css'],
  html: '<div>content</div>'
}
```

### 5. 样式隔离 (Style Isolation)

**职责：**
- 隔离应用样式
- 防止样式冲突
- 支持多种隔离方案

**核心文件：** `src/style-isolation.ts`

#### Shadow DOM 方案

```
Container
  └── Shadow Root
      ├── <style>样式1</style>
      ├── <style>样式2</style>
      └── 应用内容
```

**优点：** 完全隔离  
**缺点：** 兼容性、调试困难

#### Scoped CSS 方案

```css
/* 原始样式 */
.header { color: red; }
.content { padding: 20px; }

/* 转换后 */
[data-micro-app-app1] .header { color: red; }
[data-micro-app-app1] .content { padding: 20px; }
```

**优点：** 兼容性好、易调试  
**缺点：** 隔离不彻底

### 6. 通信系统 (Communication System)

**职责：**
- 应用间消息传递
- 全局状态管理
- 事件订阅发布

**核心文件：** `src/event-bus.ts`

#### 事件总线架构

```typescript
EventBus
│
├── events: Map<string, Set<Handler>> - 普通事件
├── onceEvents: Map<string, Set<Handler>> - 一次性事件
└── history: EventPayload[] - 历史记录

API:
- on(type, handler) - 订阅
- once(type, handler) - 订阅一次
- off(type, handler) - 取消订阅
- emit(type, data) - 发送
```

#### 全局状态架构

```typescript
GlobalState
│
├── state: Map<string, any> - 状态存储
└── listeners: Map<string, Set<Listener>> - 监听器

API:
- set(key, value) - 设置状态
- get(key) - 获取状态
- watch(key, listener) - 监听变化
- delete(key) - 删除状态
```

**通信模式：**

```
1. 点对点通信
   App A → EventBus → App B

2. 广播通信
   App A → EventBus → [App B, App C, App D]

3. 状态共享
   App A → GlobalState ← App B
           ↓
   watch: [App C, App D]
```

## 数据流

### 应用加载流程

```
用户访问 /app1
    ↓
路由系统检测到变化
    ↓
确定需要加载/挂载/卸载的应用
    ↓
并行执行：
  ├── 卸载不需要的应用
  └── 加载新应用
    ↓
  启动应用 (bootstrap)
    ↓
  挂载应用 (mount)
    ↓
  应用运行中 (mounted)
```

### 应用切换流程

```
/app1 → /app2
    ↓
1. 卸载 app1
   └── unmount() → 清理资源 → 停用沙箱
    ↓
2. 加载 app2
   ├── 已加载？→ 直接挂载
   └── 未加载？→ 加载资源 → 启动 → 挂载
    ↓
3. 激活 app2
   └── 激活沙箱 → mount() → 渲染内容
```

## 性能优化

### 1. 资源加载优化

```
并行加载：
  ├── CSS 文件并行加载
  └── JS 文件并行下载，串行执行

预加载：
  ├── 预测用户路径
  └── 提前加载可能访问的应用

缓存：
  ├── 浏览器缓存（HTTP 缓存）
  └── 内存缓存（已加载的应用）
```

### 2. 沙箱性能

```
Proxy 沙箱：
  ✅ 属性访问快（O(1)）
  ✅ 支持多实例
  ✅ 内存占用少

快照沙箱：
  ❌ 激活/停用慢（O(n)）
  ❌ 只支持单实例
  ✅ 兼容性好
```

### 3. 通信优化

```
事件总线：
  ├── 使用 Set 存储监听器（O(1) 查找）
  ├── 限制历史记录数量
  └── 及时清理无用监听器

全局状态：
  ├── 只通知订阅该状态的监听器
  └── 避免深层对象比较
```

## 扩展性

### 插件系统（未来）

```typescript
interface Plugin {
  name: string;
  apply(framework: MicroFrontend): void;
}

// 使用示例
framework.use(new RouterPlugin());
framework.use(new MonitorPlugin());
```

### 中间件支持（未来）

```typescript
// 生命周期中间件
framework.use('beforeMount', async (app, next) => {
  console.log('准备挂载:', app.name);
  await next();
});

// 路由中间件
framework.use('beforeRoute', async (to, from, next) => {
  if (!isAuthenticated()) {
    return next('/login');
  }
  await next();
});
```

## 兼容性

### 浏览器支持

```
✅ Chrome 60+
✅ Firefox 55+
✅ Safari 11+
✅ Edge 79+
❌ IE 11（不支持 Proxy，可降级使用快照沙箱）
```

### Polyfill

```javascript
// Proxy polyfill（有限支持）
import 'proxy-polyfill';

// Fetch polyfill
import 'whatwg-fetch';
```

## 安全性

### 1. XSS 防护

```
- 使用 DOMParser 解析 HTML
- 避免 innerHTML 注入
- 清理用户输入
```

### 2. 沙箱隔离

```
- 限制应用访问敏感 API
- 拦截危险操作
- 监控异常行为
```

### 3. CORS 配置

```
- 配置允许的来源
- 验证资源来源
- 使用 CSP 策略
```

## 总结

本框架采用模块化设计，各模块职责清晰：

- 🎯 **应用管理器** - 核心控制器
- 🔄 **路由系统** - 自动化应用切换
- 🔒 **沙箱系统** - JavaScript 隔离
- 📦 **资源加载器** - 智能资源管理
- 🎨 **样式隔离** - CSS 作用域隔离
- 📡 **通信系统** - 灵活的消息传递

通过这些模块的协同工作，实现了完整的微前端解决方案。

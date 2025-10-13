# 更新日志

## [1.0.0] - 2025-10-13

### ✨ 新功能

#### 核心功能
- 🎯 应用注册和生命周期管理
- 📦 智能资源加载器（支持 JavaScript、CSS、HTML）
- 🔄 路由系统和导航拦截
- 🔒 JavaScript 沙箱隔离（Proxy & Snapshot）
- 🎨 样式隔离（Shadow DOM & Scoped CSS）
- 📡 应用间通信机制（事件总线 & 全局状态）

#### 生命周期
- `bootstrap` - 应用初始化
- `mount` - 应用挂载
- `unmount` - 应用卸载
- `update` - 应用更新（可选）

#### 沙箱隔离
- **ProxySandbox** - 基于 Proxy 的沙箱（推荐）
  - 支持多实例
  - 性能优秀
  - 完整的作用域隔离
- **SnapshotSandbox** - 快照沙箱（降级方案）
  - 兼容性好
  - 单实例场景

#### 样式隔离
- **Shadow DOM** - 完全隔离
- **Scoped CSS** - CSS 前缀隔离
- **None** - 不隔离

#### 路由功能
- 自动劫持 `pushState` 和 `replaceState`
- 监听 `popstate` 和 `hashchange` 事件
- 支持路由守卫
- 支持应用预加载

#### 通信机制
- **EventBus** - 事件总线
  - 发布/订阅模式
  - 支持一次性监听
  - 事件历史记录
- **GlobalState** - 全局状态管理
  - 响应式状态
  - 状态监听
  - 状态持久化
- **Actions** - 便捷通信 API
  - 点对点消息
  - 广播消息

#### 工具函数
- 类型检查（isFunction, isPromise）
- Promise 包装（toPromise）
- DOM 操作（getContainer）
- URL 处理（resolveUrl, getHostFromUrl）
- 路径匹配（pathToRegexp）

### 📚 文档和示例

- 完整的 README 文档
- 详细的 API 说明
- 完整的示例应用
  - React 应用示例
  - Vue 应用示例
  - 原生 JavaScript 应用示例
- 示例使用说明

### 🔧 配置

- TypeScript 支持
- Rollup 构建配置
- 多种输出格式（CommonJS, ES Module, UMD）
- Source Map 支持

### 📦 发布

- NPM 包配置
- 完整的类型定义
- 多种模块格式支持

---

## 未来计划

### v1.1.0
- [ ] 预加载优化
- [ ] 性能监控
- [ ] 错误边界
- [ ] 开发者工具

### v1.2.0
- [ ] SSR 支持
- [ ] 微应用预渲染
- [ ] 资源缓存策略
- [ ] 更多示例应用

### v2.0.0
- [ ] Web Components 支持
- [ ] 插件系统
- [ ] CLI 工具
- [ ] 脚手架模板

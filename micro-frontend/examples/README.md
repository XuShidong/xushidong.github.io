# 微前端框架示例

本目录包含微前端框架的完整示例代码。

## 目录结构

```
examples/
├── main-app/           # 主应用
│   └── index.html     # 主应用入口
└── sub-apps/          # 子应用
    ├── react-app.js   # React 应用
    ├── react-app.css  # React 应用样式
    ├── vue-app.js     # Vue 应用
    ├── vue-app.css    # Vue 应用样式
    └── vanilla-app.js # 原生 JS 应用
```

## 运行示例

### 1. 构建框架

首先需要构建微前端框架：

```bash
cd micro-frontend
npm install
npm run build
```

### 2. 启动本地服务器

由于示例使用了 ES 模块，需要通过 HTTP 服务器访问。可以使用任何静态服务器，例如：

```bash
# 使用 http-server
npx http-server -p 8080

# 或使用 serve
npx serve -p 8080

# 或使用 Python
python -m http.server 8080
```

### 3. 访问示例

在浏览器中打开：

```
http://localhost:8080/examples/main-app/index.html
```

## 示例说明

### 主应用

主应用负责：
- 注册所有微应用
- 管理路由和导航
- 提供全局容器
- 启动微前端框架

### React 应用 (`/react-app`)

演示功能：
- 基本的计数器交互
- 发送和接收广播消息
- 应用间通信示例

### Vue 应用 (`/vue-app`)

演示功能：
- 响应式输入绑定
- 全局状态管理
- 状态的读取和写入

### 原生应用 (`/vanilla-app`)

演示功能：
- 实时时钟更新
- 随机颜色生成器
- 定时器管理
- 生命周期清理

## 关键特性演示

### 1. 路由切换

点击顶部导航栏切换不同的应用，观察：
- 应用的加载和卸载
- 路由的自动拦截
- 加载状态的显示

### 2. 应用隔离

每个应用：
- 拥有独立的作用域
- 不会污染全局环境
- 卸载时自动清理资源

### 3. 应用通信

在 React 应用中点击"发送广播消息"，可以看到：
- 消息在所有已加载的应用间传递
- 实时显示接收到的消息

在 Vue 应用中使用全局状态：
- 设置全局状态
- 其他应用可以读取
- 支持状态监听

## 自定义开发

### 添加新的子应用

1. 创建应用文件 `sub-apps/my-app.js`
2. 实现生命周期函数：

```javascript
async function bootstrap(props) {
  // 应用初始化
}

async function mount(props) {
  // 应用挂载
}

async function unmount(props) {
  // 应用卸载
}

// 导出生命周期
window['my-app'] = {
  bootstrap,
  mount,
  unmount
};
```

3. 在主应用中注册：

```javascript
registerMicroApps([
  {
    name: 'my-app',
    entry: {
      scripts: ['./sub-apps/my-app.js'],
      styles: ['./sub-apps/my-app.css'],
      html: '<div id="my-app-root"></div>'
    },
    container: '#app-container',
    activeRule: '/my-app'
  }
]);
```

4. 添加导航链接：

```html
<li><a href="/my-app" data-route="/my-app">我的应用</a></li>
```

## 注意事项

1. **生命周期**：确保每个应用都正确实现了生命周期函数
2. **资源清理**：在 `unmount` 中清理定时器、事件监听器等
3. **命名规范**：应用名称要与导出的全局对象名称一致
4. **路由规则**：确保 `activeRule` 与导航链接匹配

## 故障排查

### 应用没有加载

1. 检查控制台是否有错误
2. 确认应用已正确注册
3. 检查路由规则是否匹配

### 应用没有卸载

1. 检查 `unmount` 函数是否正确实现
2. 确认资源清理代码已执行

### 样式冲突

1. 使用 CSS 模块化方案
2. 添加应用前缀
3. 考虑使用 Shadow DOM

## 更多信息

查看主 [README.md](../README.md) 了解完整的 API 文档。

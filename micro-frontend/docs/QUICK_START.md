# 快速开始

这份指南将帮助你在 5 分钟内搭建一个微前端应用。

## 1. 安装

```bash
npm install @micro-frontend/core
```

## 2. 创建主应用

创建 `index.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <title>微前端应用</title>
</head>
<body>
  <nav>
    <a href="/" onclick="navigateToHome(event)">首页</a>
    <a href="/app1" onclick="navigateToApp1(event)">应用1</a>
    <a href="/app2" onclick="navigateToApp2(event)">应用2</a>
  </nav>
  
  <div id="container"></div>
  
  <script src="./main.js"></script>
</body>
</html>
```

创建 `main.js`:

```javascript
import { registerMicroApps, start, navigateTo } from '@micro-frontend/core';

// 注册微应用
registerMicroApps([
  {
    name: 'app1',
    entry: 'http://localhost:3001',
    container: '#container',
    activeRule: '/app1'
  },
  {
    name: 'app2',
    entry: 'http://localhost:3002',
    container: '#container',
    activeRule: '/app2'
  }
]);

// 启动
start();

// 导航函数
window.navigateToHome = (e) => {
  e.preventDefault();
  navigateTo('/');
};

window.navigateToApp1 = (e) => {
  e.preventDefault();
  navigateTo('/app1');
};

window.navigateToApp2 = (e) => {
  e.preventDefault();
  navigateTo('/app2');
};
```

## 3. 创建子应用

### 方式 1: 简单的 HTML 入口

创建 `app1/index.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <title>应用1</title>
  <link rel="stylesheet" href="./style.css">
</head>
<body>
  <div id="app">
    <h1>应用1</h1>
    <p>这是应用1的内容</p>
  </div>
  
  <script src="./app.js"></script>
</body>
</html>
```

创建 `app1/app.js`:

```javascript
// 导出生命周期
window.app1 = {
  async bootstrap() {
    console.log('应用1启动');
  },
  
  async mount() {
    console.log('应用1挂载');
    document.getElementById('app').style.display = 'block';
  },
  
  async unmount() {
    console.log('应用1卸载');
    document.getElementById('app').style.display = 'none';
  }
};
```

### 方式 2: 使用对象配置

```javascript
registerMicroApps([
  {
    name: 'app1',
    entry: {
      html: '<div id="app1-root"></div>',
      scripts: [
        'http://localhost:3001/app.js'
      ],
      styles: [
        'http://localhost:3001/style.css'
      ]
    },
    container: '#container',
    activeRule: '/app1'
  }
]);
```

## 4. React 应用集成

### 创建 React 子应用

```javascript
// src/index.js
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

let root = null;

// 导出生命周期
export async function bootstrap() {
  console.log('React 应用启动');
}

export async function mount(props) {
  const container = props.container 
    ? document.querySelector(props.container) 
    : document.getElementById('root');
    
  root = ReactDOM.createRoot(container);
  root.render(<App {...props} />);
}

export async function unmount() {
  if (root) {
    root.unmount();
  }
}

// 挂载到全局
window['react-app'] = {
  bootstrap,
  mount,
  unmount
};
```

## 5. Vue 应用集成

### 创建 Vue 子应用

```javascript
// src/main.js
import { createApp } from 'vue';
import App from './App.vue';

let app = null;

// 导出生命周期
export async function bootstrap() {
  console.log('Vue 应用启动');
}

export async function mount(props) {
  const container = props.container 
    ? document.querySelector(props.container) 
    : '#app';
    
  app = createApp(App);
  app.mount(container);
}

export async function unmount() {
  if (app) {
    app.unmount();
  }
}

// 挂载到全局
window['vue-app'] = {
  bootstrap,
  mount,
  unmount
};
```

## 6. 应用间通信

### 使用事件总线

```javascript
import { globalEventBus } from '@micro-frontend/core';

// 应用 A 发送消息
globalEventBus.emit('user-login', { userId: 123 });

// 应用 B 接收消息
globalEventBus.on('user-login', (payload) => {
  console.log('用户登录:', payload.data);
});
```

### 使用全局状态

```javascript
import { globalState } from '@micro-frontend/core';

// 应用 A 设置状态
globalState.set('user', { name: 'John', id: 123 });

// 应用 B 读取状态
const user = globalState.get('user');

// 应用 B 监听状态变化
globalState.watch('user', (newUser) => {
  console.log('用户信息更新:', newUser);
});
```

## 7. 运行应用

### 开发环境

1. 启动子应用服务器（端口 3001, 3002）
2. 启动主应用服务器（端口 8080）
3. 访问 `http://localhost:8080`

### 使用开发服务器

```bash
# 主应用
cd main-app
npx http-server -p 8080

# 应用1
cd app1
npx http-server -p 3001

# 应用2
cd app2
npx http-server -p 3002
```

## 8. 常见问题

### Q: 应用没有加载？

A: 检查：
1. 应用是否正确注册
2. `activeRule` 是否匹配当前路由
3. 应用服务器是否正常运行
4. 浏览器控制台是否有错误

### Q: 样式冲突？

A: 使用样式隔离：

```javascript
import { StyleIsolationManager, StyleIsolationType } from '@micro-frontend/core';

const styleManager = new StyleIsolationManager('app1', StyleIsolationType.Scoped);
```

### Q: 如何处理跨域？

A: 配置 CORS 或使用代理：

```javascript
// 开发时使用代理
registerMicroApps([
  {
    name: 'app1',
    entry: '/api/proxy/app1', // 通过代理访问
    container: '#container',
    activeRule: '/app1'
  }
]);
```

## 9. 下一步

- 查看 [完整示例](../examples/README.md)
- 阅读 [API 文档](./API.md)
- 了解 [最佳实践](./BEST_PRACTICES.md)

## 10. 获取帮助

- [GitHub Issues](https://github.com/your-repo/issues)
- [在线文档](https://your-docs-site.com)

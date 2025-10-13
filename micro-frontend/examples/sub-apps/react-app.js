/**
 * React 子应用示例
 * 这是一个简化的示例，实际项目中需要完整的 React 环境
 */

let rootElement = null;

// 启动函数
async function bootstrap(props) {
  console.log('[React App] bootstrap', props);
}

// 挂载函数
async function mount(props) {
  console.log('[React App] mount', props);
  
  const container = document.querySelector(props.container || '#react-root');
  
  // 创建应用内容
  container.innerHTML = `
    <div style="padding: 20px;">
      <h1 style="color: #61dafb;">⚛️ React 应用</h1>
      <p>这是一个 React 微应用示例</p>
      
      <div style="margin-top: 20px;">
        <button id="react-counter-btn" style="
          background: #61dafb;
          color: #fff;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
        ">
          点击次数: <span id="react-counter">0</span>
        </button>
      </div>

      <div style="margin-top: 20px;">
        <button id="react-broadcast-btn" style="
          background: #4caf50;
          color: #fff;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
        ">
          发送广播消息
        </button>
      </div>

      <div id="react-messages" style="
        margin-top: 20px;
        padding: 15px;
        background: #f0f0f0;
        border-radius: 4px;
        min-height: 100px;
      ">
        <h3>接收到的消息：</h3>
        <ul id="react-message-list"></ul>
      </div>
    </div>
  `;

  // 添加事件监听
  let counter = 0;
  const btn = container.querySelector('#react-counter-btn');
  const counterSpan = container.querySelector('#react-counter');
  
  btn.addEventListener('click', () => {
    counter++;
    counterSpan.textContent = counter;
  });

  // 添加广播按钮事件
  const broadcastBtn = container.querySelector('#react-broadcast-btn');
  broadcastBtn.addEventListener('click', () => {
    // 使用框架的事件总线发送广播
    if (window.microFrontend && window.microFrontend.actions) {
      window.microFrontend.actions.broadcast('app-message', {
        from: 'React App',
        text: `Hello from React! Count: ${counter}`,
        timestamp: new Date().toLocaleTimeString()
      });
    }
  });

  // 监听广播消息
  if (window.microFrontend && window.microFrontend.actions) {
    window.reactAppUnsubscribe = window.microFrontend.actions.onBroadcast('app-message', (data) => {
      const messageList = container.querySelector('#react-message-list');
      const li = document.createElement('li');
      li.textContent = `[${data.timestamp}] ${data.from}: ${data.text}`;
      li.style.marginBottom = '5px';
      messageList.appendChild(li);
    });
  }

  rootElement = container;
}

// 卸载函数
async function unmount(props) {
  console.log('[React App] unmount', props);
  
  if (rootElement) {
    rootElement.innerHTML = '';
    rootElement = null;
  }

  // 取消订阅
  if (window.reactAppUnsubscribe) {
    window.reactAppUnsubscribe();
  }
}

// 更新函数
async function update(props) {
  console.log('[React App] update', props);
}

// 导出生命周期
window['react-app'] = {
  bootstrap,
  mount,
  unmount,
  update
};

/**
 * Vue 子应用示例
 * 这是一个简化的示例，实际项目中需要完整的 Vue 环境
 */

let rootElement = null;

// 启动函数
async function bootstrap(props) {
  console.log('[Vue App] bootstrap', props);
}

// 挂载函数
async function mount(props) {
  console.log('[Vue App] mount', props);
  
  const container = document.querySelector(props.container || '#vue-root');
  
  // 创建应用内容
  container.innerHTML = `
    <div style="padding: 20px;">
      <h1 style="color: #42b983;">💚 Vue 应用</h1>
      <p>这是一个 Vue 微应用示例</p>
      
      <div style="margin-top: 20px;">
        <input 
          id="vue-input" 
          type="text" 
          placeholder="输入内容..."
          style="
            padding: 10px;
            font-size: 16px;
            border: 2px solid #42b983;
            border-radius: 4px;
            width: 300px;
          "
        />
      </div>

      <div id="vue-display" style="
        margin-top: 20px;
        padding: 15px;
        background: #f0f9ff;
        border-left: 4px solid #42b983;
        font-size: 18px;
      ">
        输入内容将显示在这里
      </div>

      <div style="margin-top: 20px;">
        <button id="vue-state-btn" style="
          background: #42b983;
          color: #fff;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
        ">
          设置全局状态
        </button>
        <button id="vue-get-state-btn" style="
          background: #3498db;
          color: #fff;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
          margin-left: 10px;
        ">
          获取全局状态
        </button>
      </div>

      <div id="vue-state-display" style="
        margin-top: 20px;
        padding: 15px;
        background: #fff3cd;
        border-radius: 4px;
      ">
        <h3>全局状态：</h3>
        <pre id="vue-state-content">暂无</pre>
      </div>
    </div>
  `;

  // 添加输入监听
  const input = container.querySelector('#vue-input');
  const display = container.querySelector('#vue-display');
  
  input.addEventListener('input', (e) => {
    display.textContent = e.target.value || '输入内容将显示在这里';
  });

  // 全局状态操作
  const setStateBtn = container.querySelector('#vue-state-btn');
  const getStateBtn = container.querySelector('#vue-get-state-btn');
  const stateContent = container.querySelector('#vue-state-content');

  setStateBtn.addEventListener('click', () => {
    if (window.microFrontend && window.microFrontend.globalState) {
      const data = {
        app: 'Vue App',
        inputValue: input.value,
        timestamp: new Date().toISOString()
      };
      window.microFrontend.globalState.set('vueAppData', data);
      stateContent.textContent = JSON.stringify(data, null, 2);
    }
  });

  getStateBtn.addEventListener('click', () => {
    if (window.microFrontend && window.microFrontend.globalState) {
      const data = window.microFrontend.globalState.get('vueAppData');
      stateContent.textContent = data ? JSON.stringify(data, null, 2) : '暂无';
    }
  });

  // 监听全局状态变化
  if (window.microFrontend && window.microFrontend.globalState) {
    window.vueAppUnwatch = window.microFrontend.globalState.watch('vueAppData', (value) => {
      console.log('[Vue App] 全局状态变化:', value);
    });
  }

  rootElement = container;
}

// 卸载函数
async function unmount(props) {
  console.log('[Vue App] unmount', props);
  
  if (rootElement) {
    rootElement.innerHTML = '';
    rootElement = null;
  }

  // 取消监听
  if (window.vueAppUnwatch) {
    window.vueAppUnwatch();
  }
}

// 更新函数
async function update(props) {
  console.log('[Vue App] update', props);
}

// 导出生命周期
window['vue-app'] = {
  bootstrap,
  mount,
  unmount,
  update
};

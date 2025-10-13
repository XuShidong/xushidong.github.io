/**
 * 原生 JavaScript 子应用示例
 */

let rootElement = null;
let timer = null;

// 启动函数
async function bootstrap(props) {
  console.log('[Vanilla App] bootstrap', props);
}

// 挂载函数
async function mount(props) {
  console.log('[Vanilla App] mount', props);
  
  const container = document.querySelector(props.container || '#vanilla-root');
  
  // 创建应用内容
  container.innerHTML = `
    <div style="padding: 20px;">
      <h1 style="color: #f39c12;">⚡ 原生 JavaScript 应用</h1>
      <p>这是一个纯原生 JavaScript 微应用示例</p>
      
      <div style="margin-top: 20px;">
        <h3>实时时钟：</h3>
        <div id="vanilla-clock" style="
          font-size: 48px;
          font-weight: bold;
          color: #f39c12;
          font-family: 'Courier New', monospace;
          text-align: center;
          padding: 20px;
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        ">
          00:00:00
        </div>
      </div>

      <div style="margin-top: 20px;">
        <h3>随机颜色生成器：</h3>
        <button id="vanilla-color-btn" style="
          background: #f39c12;
          color: #fff;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
        ">
          生成随机颜色
        </button>
        <div id="vanilla-color-display" style="
          margin-top: 10px;
          width: 100%;
          height: 100px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: bold;
          color: #fff;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        ">
          点击按钮生成颜色
        </div>
      </div>

      <div style="margin-top: 20px;">
        <h3>应用信息：</h3>
        <ul style="list-style: none; padding: 0;">
          <li style="padding: 5px 0;">📦 应用名称: Vanilla App</li>
          <li style="padding: 5px 0;">🎨 技术栈: 原生 JavaScript</li>
          <li style="padding: 5px 0;">⏰ 启动时间: <span id="vanilla-start-time"></span></li>
          <li style="padding: 5px 0;">🔄 运行时长: <span id="vanilla-runtime">0秒</span></li>
        </ul>
      </div>
    </div>
  `;

  // 更新时钟
  const clock = container.querySelector('#vanilla-clock');
  timer = setInterval(() => {
    const now = new Date();
    clock.textContent = now.toLocaleTimeString('zh-CN', { hour12: false });
  }, 1000);

  // 更新启动时间
  const startTime = new Date().toLocaleString('zh-CN');
  container.querySelector('#vanilla-start-time').textContent = startTime;

  // 运行时长
  let runtime = 0;
  const runtimeTimer = setInterval(() => {
    runtime++;
    container.querySelector('#vanilla-runtime').textContent = `${runtime}秒`;
  }, 1000);

  // 随机颜色生成器
  const colorBtn = container.querySelector('#vanilla-color-btn');
  const colorDisplay = container.querySelector('#vanilla-color-display');
  
  colorBtn.addEventListener('click', () => {
    const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16);
    colorDisplay.style.backgroundColor = randomColor;
    colorDisplay.textContent = randomColor.toUpperCase();
  });

  // 初始化颜色
  colorDisplay.style.backgroundColor = '#f39c12';
  colorDisplay.textContent = '#F39C12';

  rootElement = container;

  // 保存定时器以便清理
  window.vanillaAppTimers = [timer, runtimeTimer];
}

// 卸载函数
async function unmount(props) {
  console.log('[Vanilla App] unmount', props);
  
  // 清除定时器
  if (window.vanillaAppTimers) {
    window.vanillaAppTimers.forEach(timer => clearInterval(timer));
    window.vanillaAppTimers = null;
  }

  if (rootElement) {
    rootElement.innerHTML = '';
    rootElement = null;
  }
}

// 更新函数
async function update(props) {
  console.log('[Vanilla App] update', props);
}

// 导出生命周期
window['vanilla-app'] = {
  bootstrap,
  mount,
  unmount,
  update
};

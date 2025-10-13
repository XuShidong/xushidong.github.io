/**
 * 应用加载器
 * 负责加载应用的 JavaScript、CSS 和 HTML 资源
 */

import { App, LifeCycles } from './types';
import { resolveUrl, execScripts, getContainer } from './utils';

/**
 * HTML 模板处理
 */
interface ProcessedTemplate {
  html: string;
  scripts: string[];
  styles: string[];
  entry: string;
}

/**
 * 提取内联脚本
 */
function getInlineScripts(scriptElements: HTMLScriptElement[]): string[] {
  return scriptElements
    .filter(script => !script.src)
    .map(script => script.textContent || '');
}

/**
 * 提取外部脚本URL
 */
function getExternalScripts(scriptElements: HTMLScriptElement[], entry: string): string[] {
  return scriptElements
    .filter(script => script.src)
    .map(script => resolveUrl(entry, script.src));
}

/**
 * 提取内联样式
 */
function getInlineStyles(styleElements: HTMLStyleElement[]): string[] {
  return styleElements.map(style => style.textContent || '');
}

/**
 * 提取外部样式URL
 */
function getExternalStyles(linkElements: HTMLLinkElement[], entry: string): string[] {
  return linkElements
    .filter(link => link.rel === 'stylesheet' && link.href)
    .map(link => resolveUrl(entry, link.href));
}

/**
 * 解析HTML模板
 */
function parseHTML(html: string, entry: string): ProcessedTemplate {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // 提取脚本
  const scriptElements = Array.from(doc.querySelectorAll('script'));
  const inlineScripts = getInlineScripts(scriptElements);
  const externalScripts = getExternalScripts(scriptElements, entry);

  // 提取样式
  const styleElements = Array.from(doc.querySelectorAll('style'));
  const linkElements = Array.from(doc.querySelectorAll('link'));
  const inlineStyles = getInlineStyles(styleElements);
  const externalStyles = getExternalStyles(linkElements, entry);

  // 移除script和link标签，保留纯HTML
  scriptElements.forEach(el => el.remove());
  linkElements.forEach(el => {
    if (el.rel === 'stylesheet') {
      el.remove();
    }
  });

  return {
    html: doc.body.innerHTML,
    scripts: [...inlineScripts, ...externalScripts],
    styles: [...inlineStyles, ...externalStyles],
    entry
  };
}

/**
 * 加载远程资源
 */
async function fetchResource(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`加载资源失败: ${url}`);
  }
  return response.text();
}

/**
 * 加载样式
 */
async function loadStyles(styles: string[], entry: string): Promise<HTMLLinkElement[]> {
  const styleElements: HTMLLinkElement[] = [];

  for (const style of styles) {
    // 如果是URL
    if (style.startsWith('http') || style.startsWith('/')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = style;
      document.head.appendChild(link);
      styleElements.push(link);
    } else {
      // 如果是内联样式
      const styleEl = document.createElement('style');
      styleEl.textContent = style;
      document.head.appendChild(styleEl);
    }
  }

  return styleElements;
}

/**
 * 加载脚本
 */
async function loadScripts(scripts: string[]): Promise<string[]> {
  const loadedScripts: string[] = [];

  for (const script of scripts) {
    if (script.startsWith('http') || script.startsWith('/')) {
      // 外部脚本
      const scriptContent = await fetchResource(script);
      loadedScripts.push(scriptContent);
    } else {
      // 内联脚本
      loadedScripts.push(script);
    }
  }

  return loadedScripts;
}

/**
 * 执行脚本并获取生命周期
 */
function executeScriptsAndGetLifeCycles(
  scripts: string[],
  appName: string,
  sandbox?: any
): LifeCycles {
  const proxy = sandbox || window;
  
  // 执行所有脚本
  scripts.forEach(script => {
    try {
      // 创建函数执行环境
      const func = new Function('window', 'self', 'globalThis', `
        with (window) {
          ${script}
        }
      `);
      func.call(proxy, proxy, proxy, proxy);
    } catch (error) {
      console.error(`执行脚本失败 (${appName}):`, error);
    }
  });

  // 尝试获取生命周期函数
  const lifeCycles: any = {};
  
  // 1. 尝试从 window[appName] 获取
  if (proxy[appName]) {
    lifeCycles.bootstrap = proxy[appName].bootstrap;
    lifeCycles.mount = proxy[appName].mount;
    lifeCycles.unmount = proxy[appName].unmount;
    lifeCycles.update = proxy[appName].update;
  }
  
  // 2. 尝试从全局函数获取（约定命名）
  if (!lifeCycles.bootstrap) {
    lifeCycles.bootstrap = proxy[`${appName}Bootstrap`] || proxy.bootstrap;
    lifeCycles.mount = proxy[`${appName}Mount`] || proxy.mount;
    lifeCycles.unmount = proxy[`${appName}Unmount`] || proxy.unmount;
    lifeCycles.update = proxy[`${appName}Update`] || proxy.update;
  }

  return lifeCycles;
}

/**
 * 加载应用入口
 */
export async function loadAppEntry(app: App): Promise<void> {
  const { entry, name } = app;

  let html = '';
  let scripts: string[] = [];
  let styles: string[] = [];

  // 如果entry是对象，包含scripts、styles、html
  if (typeof entry === 'object') {
    scripts = entry.scripts || [];
    styles = entry.styles || [];
    html = entry.html || '';
  } else {
    // 如果entry是字符串URL，加载HTML
    html = await fetchResource(entry);
    const processed = parseHTML(html, entry);
    scripts = processed.scripts;
    styles = processed.styles;
    html = processed.html;
  }

  // 加载样式
  const styleElements = await loadStyles(styles, typeof entry === 'string' ? entry : '');
  app.styles = styleElements;

  // 加载脚本内容
  const loadedScripts = await loadScripts(scripts);

  // 渲染HTML到容器
  const container = getContainer(app.container);
  if (container && html) {
    container.innerHTML = html;
  }

  // 执行脚本并获取生命周期（需要沙箱支持）
  // 这里先使用window，后续会被沙箱代理替换
  const lifeCycles = executeScriptsAndGetLifeCycles(loadedScripts, name);

  // 如果没有获取到生命周期，创建默认的
  if (!lifeCycles.mount) {
    lifeCycles.bootstrap = async () => {
      console.log(`应用 ${name} bootstrap`);
    };
    lifeCycles.mount = async () => {
      console.log(`应用 ${name} mount`);
      // 如果有HTML但没有mount函数，至少渲染HTML
      const container = getContainer(app.container);
      if (container && html) {
        container.innerHTML = html;
      }
    };
    lifeCycles.unmount = async () => {
      console.log(`应用 ${name} unmount`);
      const container = getContainer(app.container);
      if (container) {
        container.innerHTML = '';
      }
    };
  }

  app.lifeCycles = lifeCycles;
}

/**
 * 预加载应用
 */
export async function prefetchApp(entry: string): Promise<void> {
  try {
    // 预加载HTML
    const html = await fetchResource(entry);
    const processed = parseHTML(html, entry);

    // 预加载脚本
    const scriptPromises = processed.scripts
      .filter(script => script.startsWith('http') || script.startsWith('/'))
      .map(script => fetchResource(script));

    // 预加载样式
    const stylePromises = processed.styles
      .filter(style => style.startsWith('http') || style.startsWith('/'))
      .map(style => fetchResource(style));

    await Promise.all([...scriptPromises, ...stylePromises]);
    console.log(`应用 ${entry} 预加载完成`);
  } catch (error) {
    console.error(`预加载应用失败: ${entry}`, error);
  }
}

/**
 * 样式隔离
 * 提供两种隔离方式：Shadow DOM 和 Scoped CSS
 */

/**
 * 样式隔离类型
 */
export enum StyleIsolationType {
  None = 'none',           // 不隔离
  ShadowDOM = 'shadow',    // 使用Shadow DOM
  Scoped = 'scoped'        // 使用CSS作用域
}

/**
 * 生成唯一的作用域ID
 */
function generateScopeId(appName: string): string {
  return `micro-app-${appName}`;
}

/**
 * 为CSS选择器添加作用域
 */
function scopeCSS(css: string, scopeId: string): string {
  const prefix = `[data-${scopeId}]`;
  
  // 简单的CSS作用域实现
  return css.replace(
    /([^\r\n,{}]+)(,(?=[^}]*{)|\s*{)/g,
    (match, selector, suffix) => {
      // 处理特殊选择器
      if (
        selector.trim().startsWith('@') ||
        selector.trim().startsWith('html') ||
        selector.trim().startsWith('body') ||
        selector.trim().startsWith(':root')
      ) {
        return match;
      }
      
      // 添加作用域前缀
      return `${prefix} ${selector.trim()}${suffix}`;
    }
  );
}

/**
 * 创建Shadow DOM容器
 */
export function createShadowContainer(container: HTMLElement, appName: string): ShadowRoot {
  // 如果已经有shadow root，直接返回
  if (container.shadowRoot) {
    return container.shadowRoot;
  }

  // 创建shadow root
  const shadowRoot = container.attachShadow({ mode: 'open' });

  // 添加基础样式重置（可选）
  const styleReset = document.createElement('style');
  styleReset.textContent = `
    :host {
      display: block;
      position: relative;
    }
  `;
  shadowRoot.appendChild(styleReset);

  return shadowRoot;
}

/**
 * 应用样式隔离
 */
export function applyScopedStyles(
  container: HTMLElement,
  styles: string[],
  appName: string
): HTMLStyleElement[] {
  const scopeId = generateScopeId(appName);
  const styleElements: HTMLStyleElement[] = [];

  // 给容器添加作用域标识
  container.setAttribute(`data-${scopeId}`, '');

  // 处理每个样式
  styles.forEach(style => {
    const styleEl = document.createElement('style');
    
    // 为CSS添加作用域
    styleEl.textContent = scopeCSS(style, scopeId);
    
    // 添加到head
    document.head.appendChild(styleEl);
    styleElements.push(styleEl);
  });

  return styleElements;
}

/**
 * 应用Shadow DOM样式隔离
 */
export function applyShadowStyles(
  shadowRoot: ShadowRoot,
  styles: string[]
): HTMLStyleElement[] {
  const styleElements: HTMLStyleElement[] = [];

  styles.forEach(style => {
    const styleEl = document.createElement('style');
    styleEl.textContent = style;
    shadowRoot.appendChild(styleEl);
    styleElements.push(styleEl);
  });

  return styleElements;
}

/**
 * 移除作用域样式
 */
export function removeScopedStyles(
  container: HTMLElement,
  styleElements: HTMLStyleElement[],
  appName: string
): void {
  const scopeId = generateScopeId(appName);
  
  // 移除作用域标识
  container.removeAttribute(`data-${scopeId}`);
  
  // 移除样式元素
  styleElements.forEach(el => el.remove());
}

/**
 * 样式隔离管理器
 */
export class StyleIsolationManager {
  private isolationType: StyleIsolationType;
  private appName: string;
  private styleElements: HTMLStyleElement[] = [];
  private shadowRoot?: ShadowRoot;

  constructor(appName: string, isolationType: StyleIsolationType = StyleIsolationType.Scoped) {
    this.appName = appName;
    this.isolationType = isolationType;
  }

  /**
   * 应用样式
   */
  applyStyles(container: HTMLElement, styles: string[]): void {
    if (this.isolationType === StyleIsolationType.None) {
      // 不做隔离，直接插入样式
      styles.forEach(style => {
        const styleEl = document.createElement('style');
        styleEl.textContent = style;
        document.head.appendChild(styleEl);
        this.styleElements.push(styleEl);
      });
    } else if (this.isolationType === StyleIsolationType.ShadowDOM) {
      // 使用Shadow DOM
      this.shadowRoot = createShadowContainer(container, this.appName);
      this.styleElements = applyShadowStyles(this.shadowRoot, styles);
    } else {
      // 使用作用域CSS
      this.styleElements = applyScopedStyles(container, styles, this.appName);
    }
  }

  /**
   * 获取渲染容器
   */
  getRenderContainer(container: HTMLElement): HTMLElement | ShadowRoot {
    if (this.isolationType === StyleIsolationType.ShadowDOM && this.shadowRoot) {
      return this.shadowRoot;
    }
    return container;
  }

  /**
   * 清理样式
   */
  cleanup(container: HTMLElement): void {
    if (this.isolationType === StyleIsolationType.Scoped) {
      removeScopedStyles(container, this.styleElements, this.appName);
    } else {
      this.styleElements.forEach(el => el.remove());
    }
    
    this.styleElements = [];
  }
}

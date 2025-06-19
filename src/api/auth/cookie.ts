/**
 * Cookie 工具函数
 * 用于前端 Cookie 的读写操作，支持安全性配置
 */

export interface CookieOptions {
  /** 过期时间（天数），默认为会话 cookie */
  expires?: number;
  /** 路径，默认为 '/' */
  path?: string;
  /** 域名 */
  domain?: string;
  /** 是否仅在 HTTPS 下传输 */
  secure?: boolean;
  /** 是否禁止 JavaScript 访问（仅在服务端设置时有效） */
  httpOnly?: boolean;
  /** SameSite 属性 */
  sameSite?: 'Strict' | 'Lax' | 'None';
}

/**
 * 设置 Cookie
 * @param name Cookie 名称
 * @param value Cookie 值
 * @param options Cookie 选项
 */
export const setCookie = (name: string, value: string, options: CookieOptions = {}): void => {
  const {
    expires,
    path = '/',
    domain,
    secure = false,
    sameSite = 'Lax'
  } = options;

  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  if (expires) {
    const date = new Date();
    date.setTime(date.getTime() + (expires * 24 * 60 * 60 * 1000));
    cookieString += `; expires=${date.toUTCString()}`;
  }

  if (path) {
    cookieString += `; path=${path}`;
  }

  if (domain) {
    cookieString += `; domain=${domain}`;
  }

  if (secure) {
    cookieString += `; secure`;
  }

  if (sameSite) {
    cookieString += `; samesite=${sameSite}`;
  }

  document.cookie = cookieString;
};

/**
 * 获取 Cookie
 * @param name Cookie 名称
 * @returns Cookie 值，如果不存在则返回 null
 */
export const getCookie = (name: string): string | null => {
  const nameEQ = encodeURIComponent(name) + '=';
  const cookies = document.cookie.split(';');

  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length));
    }
  }

  return null;
};

/**
 * 删除 Cookie
 * @param name Cookie 名称
 * @param options Cookie 选项（主要用于指定 path 和 domain）
 */
export const removeCookie = (name: string, options: Pick<CookieOptions, 'path' | 'domain'> = {}): void => {
  const { path = '/', domain } = options;

  let cookieString = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`;

  if (path) {
    cookieString += `; path=${path}`;
  }

  if (domain) {
    cookieString += `; domain=${domain}`;
  }

  document.cookie = cookieString;
};

/**
 * 检查是否支持 Cookie
 * @returns 是否支持 Cookie
 */
export const isCookieSupported = (): boolean => {
  if (typeof document === 'undefined') {
    return false;
  }

  try {
    const testCookie = '__test_cookie__';
    setCookie(testCookie, 'test');
    const supported = getCookie(testCookie) === 'test';
    removeCookie(testCookie);
    return supported;
  } catch {
    return false;
  }
};

/**
 * 获取所有 Cookie
 * @returns Cookie 对象
 */
export const getAllCookies = (): Record<string, string> => {
  const cookies: Record<string, string> = {};

  if (typeof document === 'undefined') {
    return cookies;
  }

  document.cookie.split(';').forEach(cookie => {
    const [name, value] = cookie.trim().split('=');
    if (name && value) {
      cookies[decodeURIComponent(name)] = decodeURIComponent(value);
    }
  });

  return cookies;
};

// 导出默认的 token 相关 Cookie 配置
export const TOKEN_COOKIE_CONFIG: CookieOptions = {
  expires: 7, // 7天过期
  path: '/',
  secure: location.protocol === 'https:', // 在 HTTPS 环境下启用 secure
  sameSite: 'Lax'
  // 注意：httpOnly 只能在服务端设置，前端无法设置 httpOnly cookie
};

// 更安全的 token cookie 配置建议（需要后端配合）
export const SECURE_TOKEN_COOKIE_CONFIG: CookieOptions = {
  expires: 1, // 1天过期，更短的过期时间
  path: '/',
  secure: true, // 仅 HTTPS
  sameSite: 'Strict' // 更严格的同站策略
  // httpOnly: true, // 只能在服务端设置
};

// 常用的 Cookie 名称常量
export const COOKIE_NAMES = {
  TOKEN: 'auth_token'
  // 移除 USER_DATA，因为我们不再在 cookie 中存储用户数据
} as const;

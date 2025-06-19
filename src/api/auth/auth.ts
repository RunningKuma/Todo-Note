import type { UserData } from "../types/user";
import { setCookie, getCookie, removeCookie, TOKEN_COOKIE_CONFIG, COOKIE_NAMES } from "./cookie";
import router from "@/router";
import { testUserData } from "../constants/test";

let _userData: UserData | undefined;

export const userOps = {
  manualCheckAuth: (): Promise<boolean> => {
    // userData = userOps.getUserData();
    const token = getCookie(COOKIE_NAMES.TOKEN);
    if (!token) return Promise.resolve(false);

    //@todo use axios instead
    return fetch('/api/auth/manualCheck', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => {
        if (response.ok) {
          return true;
        }
        throw new Error('Network response was not ok');
      })
      .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
        return false;
      });
  },
  getUserData: async (): Promise<UserData | undefined> => {
    if (_userData === undefined) {
      // 如果内存中没有用户数据，且有有效 token，则从服务器获取
      const token = getCookie(COOKIE_NAMES.TOKEN);
      if (token) {
        return userOps.fetchUserData().then(data => {
          if (data) {
            return data;
          } else {
            console.warn('无法获取用户数据，可能是 token 已过期或无效。');
          }
        });
      } else {
        console.warn('无法找到有效的认证 token，请重新登录.');
        router.push({ name: 'auth' });
        return undefined;
      }
    }
    // return _userData;
  },

  // 从服务器获取用户数据
  fetchUserData: async (): Promise<UserData | undefined> => {
    const token = getCookie(COOKIE_NAMES.TOKEN);
    if (!token) {
      return undefined;
    }

    //@todo implement server user api
    return testUserData;

    try {
      const response = await fetch('/api/user/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userData = await response.json() as UserData;
        _userData = userData;
        return userData;
      } else {
        removeCookie(COOKIE_NAMES.TOKEN);
        return undefined;
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      return undefined;
    }
  },
  getLoginOptions: async (email: string): Promise<{ success: boolean, message: string }> => {
    // 我也不知道在写什么了后来者再优化吧()
    const response = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
      .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
        return { status: 600, success: false, statusText: 'Network error. Please try again later.' } as unknown as Response;
      });
    const { message } = (await response.json().catch(() => { return { message: '' }; }));
    if (response.status === 201) {
      return { success: true, message };
    }
    if (response.status === 401) {
      return { success: false, message };
    }
    return { success: false, message: response.statusText };
  },
  login: async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
      .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
        return { status: 600, success: false, statusText: 'Network error. Please try again later.' } as unknown as Response;
      });
    const { userData, message } = (await response.json().catch(() => { return { message: '' }; })) as { userData: UserData, message: string };
    if (response.status === 200) {
      _userData = userData;
      // 只将 token 存储到 cookie，用户数据保存在内存中
      setCookie(COOKIE_NAMES.TOKEN, userData.token!, TOKEN_COOKIE_CONFIG);

      return { success: true, message };
    }
    if (response.status === 401) {
      return { success: false, message };
    }
    return { success: false, message: response.statusText };
  },
  register: async (email: string, username: string, password: string) => {
    const response = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, username, password }) })
      .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
        return { status: 600, success: false, statusText: 'Network error. Please try again later.' } as unknown as Response;
      });
    // 检查响应类型
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return {
        success: false,
        message: '服务器响应格式错误'
      };
    }
    const { message } = (await response.json().catch(() => { return { message: 'Invalid respond' }; }));
    if (response.status === 201) {
      return { success: true, message };
    }
    if (response.status === 401) {
      return { success: false, message };
    }
    return { success: false, message: response.statusText };
  },
  logout: () => {
    _userData = undefined;
    removeCookie(COOKIE_NAMES.TOKEN);
  }
};

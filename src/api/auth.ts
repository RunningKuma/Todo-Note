import { testUserData } from "./constants/test";
import type { UserData } from "./types/user";

let _userData: UserData | undefined;

const checkEmail = (email: string) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const userOps = {
  manualCheckAuth: (): Promise<boolean> => {
    //@todo 换成使用 token 判断
    // userData = userOps.getUserData();
    // if (!sessionStorage.getItem('token')) return false;
    return fetch('/api/auth/manualCheck', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionStorage.getItem('token')}`
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
  getUserData: () => {
    if (_userData === undefined) {
      const storedData = sessionStorage.getItem('userData');
      if (storedData) {
        _userData = JSON.parse(storedData);
      }
      else {
        _userData = undefined;
        //@todo use toast instead
        console.warn('无法在本地找到用户数据，请检查登录状态.');
      }
    }
    return _userData;
  },
  getLoginOptions: async (email: string): Promise<{ success: boolean, message: string }> => {
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
      sessionStorage.setItem('token', userData.token!);
      sessionStorage.setItem('userData', JSON.stringify(userData));

      return { success: true, message };
    }
    if (response.status === 401) {
      return { success: false, message };
    }
    return { success: false, message: response.statusText };
  },
  register: async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true, message: 'Registration successful. Please log in.' };
  },
  logout: () => {
    _userData = undefined;
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('userData');
  }
};

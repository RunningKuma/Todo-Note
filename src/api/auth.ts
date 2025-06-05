import { testUserData } from "./constants/test";
import type { UserData } from "./types/user";

let isAuthenticated: boolean;
let userData: UserData | undefined;

const checkEmail = (email: string) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const userOps = {
  checkAuth: () => {
    //@todo 换成使用 token 判断
    userData = userOps.getUserData();
    return userData !== undefined; // && isAuthenticated === true
  },
  getUserData: () => {
    if (userData === undefined) {
      const storedData = sessionStorage.getItem('userData');
      if (storedData) {
        userData = JSON.parse(storedData);
        isAuthenticated = true;
      }
      else {
        userData = undefined;
        isAuthenticated = false;
        //@todo use toast instead
        console.warn('无法在本地找到用户数据，请检查登录状态.');
      }
    }
    return userData;
  },
  getLoginOptions: async (email: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (!checkEmail(email)) {
      return { success: false, message: 'Invalid email format.' };
    } else if (email === "test@test.com") {
      return { success: true };
    } else {
      return { success: false, message: 'Account not found. Please sign up.' };
    }
  },
  login: async (email: string, password: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (!checkEmail(email)) {
      return { success: false, message: 'Invalid email format.' };
    } else if (email !== "test@test.com") {
      return { success: false, message: 'Account not found. Please sign up.' };
    } else if (password !== "123456") {
      return { success: false, message: 'Incorrect password.' };
    }

    userData = testUserData;
    isAuthenticated = true;
    sessionStorage.setItem('userData', JSON.stringify(userData));
    return { success: true };
  },
  logout: () => {
    userData = undefined;
    isAuthenticated = false;
    sessionStorage.removeItem('userData');
  }
};

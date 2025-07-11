// test/controllers/authController.test.ts

import { AuthController } from '@server/controllers/authController';
import { Request, Response } from 'express';
import { UserService } from '@server/services/userService';
import { randomUUID } from 'crypto';

// 模拟UserService
jest.mock('@server/services/userService');
// 模拟JWT工具
jest.mock('@server/utils/jwt', () => ({
  generateToken: jest.fn().mockReturnValue('mock-token'),
  verifyToken: jest.fn().mockReturnValue({ id: 'mock-user-id' })
}));
// 模拟密码工具
jest.mock('@server/utils/password', () => ({
  hashPassword: jest.fn().mockImplementation(async (pwd) => `hashed-${pwd}`),
  comparePassword: jest.fn().mockImplementation(async (pwd, hash) => {
    return hash === `hashed-${pwd}`;
  })
}));

// 模拟Request和Response对象
const mockRequest = () => {
  const req: Partial<Request> = {};
  req.body = {};
  req.headers = {};
  return req as Request;
};

const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.header = jest.fn().mockReturnValue(res);
  return res as Response;
};

describe('AuthController', () => {
  let authController: AuthController;
  let mockUserService: jest.Mocked<UserService>;
  
  beforeEach(() => {
    // 清除所有模拟
    jest.clearAllMocks();
    
    // 创建模拟的UserService
    mockUserService = new UserService() as jest.Mocked<UserService>;
    
    // 创建控制器实例
    authController = new AuthController();
    // 手动替换控制器中的UserService实例为我们的模拟
    (authController as any).userService = mockUserService;
    
    // 为JWT设置一个测试秘钥
    process.env.JWT_SECRET = 'test-secret-key';
  });
  
  describe('register', () => {
    it('应该成功注册用户并返回201状态码', async () => {
      // 准备请求和响应对象
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123'
      };
      
      // 模拟UserService.createUser方法（成功创建用户）
      const mockUser = {
        id: randomUUID(),
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashed-password123'
      };
      mockUserService.createUser = jest.fn().mockResolvedValue(mockUser);
      
      // 执行注册方法
      await authController.register(req, res);
      
      // 断言
      expect(mockUserService.createUser).toHaveBeenCalledWith(
        'test@example.com', 
        'testuser', 
        expect.any(String)
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'User registered successfully',
          user: expect.objectContaining({
            email: 'test@example.com',
            username: 'testuser'
          })
        })
      );
    });
    
    it('当用户已存在时应返回400状态码', async () => {
      // 准备请求和响应对象
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        email: 'duplicate@example.com',
        username: 'duplicateuser',
        password: 'password123'
      };
      
      // 模拟UserService.createUser方法抛出约束错误
      const error = new Error('SQLITE constraint error');
      (error as any).code = 'SQLITE_CONSTRAINT';
      mockUserService.createUser = jest.fn().mockRejectedValue(error);
      
      // 执行注册方法
      await authController.register(req, res);
      
      // 断言
      expect(mockUserService.createUser).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'User already exists'
        })
      );
    });
  });
  
  describe('login', () => {
    it('应该成功登录并返回用户数据', async () => {
      // 准备请求和响应对象
      const loginReq = mockRequest();
      const loginRes = mockResponse();
      
      const email = 'login-test@example.com';
      const username = 'loginuser';
      const password = 'password123';
      
      loginReq.body = {
        email,
        password
      };
      
      // 模拟UserService.getUserByEmail方法返回一个用户
      mockUserService.getUserByEmail = jest.fn().mockResolvedValue({
        id: randomUUID(),
        email,
        username,
        password: `hashed-${password}`
      });
      
      // 模拟TodoService
      (authController as any).todoService = {
        getUserTodos: jest.fn().mockResolvedValue([])
      };
      
      // 执行登录方法
      await authController.login(loginReq, loginRes);
      
      // 断言
      expect(mockUserService.getUserByEmail).toHaveBeenCalledWith(email);
      expect(loginRes.status).toHaveBeenCalledWith(200);
      expect(loginRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          userData: expect.objectContaining({
            email,
            username
          })
        })
      );
      expect(loginRes.header).toHaveBeenCalledWith(
        'Authorization',
        expect.stringMatching(/^Bearer /)
      );
    });
    
    it('当用户不存在时应返回401状态码', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };
      
      // 模拟UserService.getUserByEmail方法返回null（用户不存在）
      mockUserService.getUserByEmail = jest.fn().mockResolvedValue(null);
      
      // 执行登录方法
      await authController.login(req, res);
      
      // 断言
      expect(mockUserService.getUserByEmail).toHaveBeenCalledWith('nonexistent@example.com');
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'User not found'
        })
      );
    });
    
    it('当密码错误时应返回401状态码', async () => {
      // 准备请求和响应对象
      const loginReq = mockRequest();
      const loginRes = mockResponse();
      
      const email = 'wrong-password@example.com';
      const username = 'wrongpassworduser';
      const password = 'password123';
      
      loginReq.body = {
        email,
        password: 'wrongpassword'
      };
      
      // 模拟UserService.getUserByEmail方法返回一个用户
      mockUserService.getUserByEmail = jest.fn().mockResolvedValue({
        id: randomUUID(),
        email,
        username,
        password: `hashed-${password}` // 与请求中的密码不匹配
      });
      
      // 执行登录方法
      await authController.login(loginReq, loginRes);
      
      // 断言
      expect(mockUserService.getUserByEmail).toHaveBeenCalledWith(email);
      expect(loginRes.status).toHaveBeenCalledWith(401);
      expect(loginRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Incorrect password.'
        })
      );
    });
  });
});

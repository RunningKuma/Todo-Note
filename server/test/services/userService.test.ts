// test/services/userService.test.ts

import { UserService } from '@server/services/userService';

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
  });

  // 基本初始化测试
  describe('初始化', () => {
    it('应该能够正确初始化UserService', () => {
      expect(userService).toBeInstanceOf(UserService);
    });
  });

  describe('createUser', () => {
    it('应该创建一个新的用户', async () => {
      // 创建测试数据
      const email = 'test@example.com';
      const username = 'testuser';
      const password = 'password123';
      
      // 创建用户
      const user = await userService.createUser(email, username, password);
      
      // 断言
      expect(user).toBeTruthy();
      expect(user?.id).toBeDefined();
      expect(user?.email).toBe(email);
      expect(user?.username).toBe(username);
      expect(user?.password).toBe(password); // 注意：实际应用中密码应该被哈希
    });

    it('应该拒绝创建重复的用户名', async () => {
      // 创建第一个用户
      const email1 = 'user1@example.com';
      const username = 'sameusername';
      const password = 'password123';
      
      await userService.createUser(email1, username, password);
      
      // 尝试创建具有相同用户名的第二个用户
      const email2 = 'user2@example.com';
      
      // 断言应该抛出错误
      await expect(
        userService.createUser(email2, username, password)
      ).rejects.toThrow();
    });

    it('应该拒绝创建重复的电子邮件', async () => {
      // 创建第一个用户
      const email = 'duplicate@example.com';
      const username1 = 'user1';
      const password = 'password123';
      
      await userService.createUser(email, username1, password);
      
      // 尝试创建具有相同电子邮件的第二个用户
      const username2 = 'user2';
      
      // 断言应该抛出错误
      await expect(
        userService.createUser(email, username2, password)
      ).rejects.toThrow();
    });
  });

  describe('getUserById', () => {
    it('应该通过ID获取用户', async () => {
      // 创建一个用户
      const email = 'getbyid@example.com';
      const username = 'getbyiduser';
      const password = 'password123';
      
      const createdUser = await userService.createUser(email, username, password);
      expect(createdUser).toBeTruthy();
      
      // 通过ID获取用户
      const user = await userService.getUserById(createdUser!.id);
      
      // 断言
      expect(user).not.toBeNull();
      expect(user?.id).toBe(createdUser!.id);
      expect(user?.email).toBe(email);
      expect(user?.username).toBe(username);
    });
    
    it('当用户不存在时应返回null', async () => {
      const result = await userService.getUserById('non-existent-id');
      expect(result).toBeNull();
    });
  });
  
  describe('getUserByUsername', () => {
    it('应该通过用户名获取用户', async () => {
      // 创建一个用户
      const email = 'getbyusername@example.com';
      const username = 'findmebyusername';
      const password = 'password123';
      
      await userService.createUser(email, username, password);
      
      // 通过用户名获取用户
      const user = await userService.getUserByUsername(username);
      
      // 断言
      expect(user).not.toBeNull();
      expect(user?.email).toBe(email);
      expect(user?.username).toBe(username);
    });
    
    it('当用户名不存在时应返回null', async () => {
      const result = await userService.getUserByUsername('non-existent-username');
      expect(result).toBeNull();
    });
  });
  
  describe('getUserByEmail', () => {
    it('应该通过电子邮件获取用户', async () => {
      // 创建一个用户
      const email = 'findme@example.com';
      const username = 'emailuser';
      const password = 'password123';
      
      await userService.createUser(email, username, password);
      
      // 通过电子邮件获取用户
      const user = await userService.getUserByEmail(email);
      
      // 断言
      expect(user).not.toBeNull();
      expect(user?.email).toBe(email);
      expect(user?.username).toBe(username);
    });
    
    it('当电子邮件不存在时应返回null', async () => {
      const result = await userService.getUserByEmail('non-existent@example.com');
      expect(result).toBeNull();
    });
  });
});
// src/services/userService.ts

import { User } from '../models/user';

export class UserService {
    async createUser(username: string, password: string): Promise<User> {
        // 这里可以添加创建用户的逻辑
        const newUser = new User(username, password);
        await newUser.save();
        return newUser;
    }

    async getUserById(id: number): Promise<User | null> {
        // 这里可以添加根据 ID 获取用户的逻辑
        return await User.findById(id);
    }

    async getUserByUsername(username: string): Promise<User | null> {
        // 这里可以添加根据用户名获取用户的逻辑
        return await User.findByUsername(username);
    }
}
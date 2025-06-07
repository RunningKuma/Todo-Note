// src/services/userService.ts

import { randomUUID } from 'crypto';
import { User } from '../models/user';
import { UserRawData } from '@server/types/db';

export class UserService {
  async createUser(email: string, username: string, password: string): Promise<UserRawData | null> {
    const id = randomUUID();
    await User.create(id, email, username, password);
    return await User.findUser.findById(id);
  }

  async getUserById(id: string): Promise<UserRawData | null> {
    return await User.findUser.findById(id);
  }

  async getUserByUsername(username: string): Promise<UserRawData | null> {
    return await User.findUser.findByUsername(username);
  }

  async getUserByEmail(email: string): Promise<UserRawData | null> {
    return await User.findUser.findByEmail(email);
  }
}
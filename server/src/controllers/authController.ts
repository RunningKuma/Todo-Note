import { Request, Response } from 'express';
import { UserService } from '../services/userService';
import { User } from '../models/user';
import { hashPassword, comparePassword } from '../utils/password';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { UserData } from '@server/types/user';
import { generateToken, verifyToken } from '@server/utils/jwt';

export class AuthController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  //! 使用 成员定义 会导致 express 路由处理器中的 this 绑定丢失为 undefined
  // public async register(req: Request, res: Response): Promise<void> {
  public register = async (req: Request, res: Response): Promise<void> => {
    const { email, username, password }: { email: string; username: string; password: string } = req.body;

    //@todo 传过来的 password 不应是明文
    const hashedPassword = await hashPassword(password);

    try {
      const userData = await this.userService.createUser(email, username, hashedPassword);
      res.status(201).json({ message: 'User registered successfully', user: userData }).send();
    } catch (error) {
      console.error('Error registering user:', error);
      //@dtodo implement error type
      if ((error as { code: string }).code === 'SQLITE_CONSTRAINT') {
        res.status(400).json({ message: 'User already exists' }).send();
        return;
      }
      res.status(500).json({ message: 'Error registering user: ' + error }).send();
    }
  };

  public login = async (req: Request, res: Response): Promise<void> => {
    const { email, password }: { email: string; password: string } = req.body;

    try {
      const user = await this.userService.getUserByEmail(email);
      if (!user) {
        res.status(401).json({ message: 'User not found' }).send();
        return;
      }

      // getLoginOptions
      if (password === undefined) {
        res.status(201).send();
        return;
      }
      const isMatch = await comparePassword(password, user.password);
      if (!isMatch) {
        res.status(401).json({ message: 'Incorrect password.' }).send();
        return;
      }

      //@todo implement jwt secret in env
      if (!process.env.JWT_SECRET) {
        console.warn('JWT_SECRET is not set.');
      }
      //@todo expire？
      const token = generateToken(user.id);

      //@todo implement todos query

      res.status(200).json({ userData: { id: user.id, email: user.email, username: user.username, token, todo: [] } as UserData, message: '' }).send();
    } catch (error) {
      console.error('Error logging in:', error);
      res.status(500).json({ message: 'Error logging in', error }).send();
    }
  };
  public manualCheck = async (req: Request, res: Response): Promise<void> => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      res.status(401).json({ message: 'No token provided' }).send();
      return;
    }

    try {
      const decoded = verifyToken(token) as { id: string | undefined };
      if (!decoded || !decoded.id) {
        res.status(401).json({ message: 'Invalid token' }).send();
        return;
      }
      const user = await this.userService.getUserById(decoded.id);
      if (!user) {
        res.status(401).json({ message: 'Invalid token' }).send();
        return;
      }

      res.status(200).send();
    } catch (error) {
      console.error('Error verifying token:', error);
      res.status(401).json({ message: 'Invalid token', error }).send();
    }
  };
}
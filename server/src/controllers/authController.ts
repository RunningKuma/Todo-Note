import { Request, Response } from 'express';
import { UserService } from '../services/userService';
import { User } from '../models/user';
import { hashPassword, comparePassword } from '../utils/password';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { UserData } from '@server/types/user';

export class AuthController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  public async register(req: Request, res: Response): Promise<void> {
    const { email, username, password }: { email: string; username: string; password: string } = req.body;

    const hashedPassword = await hashPassword(password);

    try {
      await this.userService.createUser(email, username, hashedPassword);
      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error registering user', error });
    }
  }

  public async login(req: Request, res: Response): Promise<void> {
    const { email, password }: { email: string; password: string } = req.body;

    try {
      const user = await this.userService.getUserByEmail(email);
      if (!user) {
        res.status(401).json({ message: 'Invalid credentials' }).send();
        return;
      }

      const isMatch = await comparePassword(password, user.password);
      if (!isMatch) {
        res.status(401).json({ message: 'Invalid credentials' }).send();
        return;
      }

      //@todo implement jwt secret in env
      if (!process.env.JWT_SECRET) {
        console.warn('JWT_SECRET is not set.');
      }
      //@todo expire？
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string);//, { expiresIn: '1h' }

      //@todo implement todos query

      res.status(200).json({ id: user.id, email: user.email, username: user.username, token, todo: [] } as UserData);
    } catch (error) {
      res.status(500).json({ message: 'Error logging in', error });
    }
  }
}
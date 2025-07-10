import { Request, Response } from 'express';
import { UserService } from '../services/userService';
import { TodoService } from '../services/todoService';
import { User } from '../models/user';
import { hashPassword, comparePassword } from '../utils/password';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { UserData_Old } from '@server/types/user';
import { generateToken, verifyToken } from '@server/utils/jwt';
import nodemailer, { TransportOptions } from 'nodemailer'
import { ApiResponse } from '@server/types/request';
import { UserRawData } from '@server/types/db';

export class AuthController {
  private userService: UserService;
  private todoService: TodoService;

  constructor() {
    this.userService = new UserService();
    this.todoService = new TodoService();
  }

  //! 使用 成员定义 会导致 express 路由处理器中的 this 绑定丢失为 undefined
  // public async register(req: Request, res: Response): Promise<void> {
  public register = async (req: Request, res: Response<ApiResponse<UserRawData>>): Promise<void> => {
    const { email, username, password, code }: { email: string; username: string; password: string, code: string } = req.body;

    // 邮箱验证码逻辑
    if (!email || !code) {
      res.status(400).json({ success: false, message: '邮箱或验证码为空' })
      return
    }
    const storedData = this.verificationCodes.get(email);
    if (!storedData) {
      res.status(400).json({ success: false, message: '验证码不存在或已过期' });
      return
    }

    if (Date.now() > storedData.expires) {
      this.verificationCodes.delete(email);
      res.status(400).json({ success: false, message: '验证码已过期' });
      return
    }

    if (storedData.code !== code) {
      res.status(400).json({ success: false, message: '验证码错误' });
      return
    }

    // 验证成功，删除验证码
    this.verificationCodes.delete(email);

    //@todo 传过来的 password 不应是明文
    const hashedPassword = await hashPassword(password);

    try {
      const userData = await this.userService.createUser(email, username, hashedPassword);
      // @ts-expect-error 忽略这里的接口定义错误了……
      res.status(201).json({ message: 'User registered successfully', user: userData }).send();
    } catch (error) {
      console.error('Error registering user:', error);
      //@dtodo implement error type
      if ((error as { code: string }).code === 'SQLITE_CONSTRAINT') {
        res.status(400).json({ success: false, message: 'User already exists' }).send();
        return;
      }
      res.status(500).json({ success: false, message: 'Error registering user: ' + error }).send();
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
      }      //@todo implement jwt secret in env
      if (!process.env.JWT_SECRET) {
        console.warn('JWT_SECRET is not set.');
      }
      //@todo expire？
      const token = generateToken(user.id);
      res.header('Authorization', `Bearer ${token}`);
      // 获取用户的TODO列表
      const userTodos = await this.todoService.getUserTodos(user.id);

      res.status(200).json({ userData: { id: user.id, email: user.email, username: user.username, todo: userTodos } as UserData_Old, message: '' }).send();
    } catch (error) {
      console.error('Error logging in:', error);
      res.status(500).json({ message: 'Error logging in', error }).send();
    }
  };
  private verificationCodes = new Map<string, { code: string; expires: number }>()
  private transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST, // 163 邮箱 SMTP 服务器地址
    port: process.env.MAIL_PORT, // SMTP 端口号
    secure: true, // 使用 SSL 加密
    auth: {
      user: process.env.MAIL_USER, // 替换为你的邮箱
      pass: process.env.MAIL_SMTP     // 替换为你的应用密码
    }
  } as TransportOptions)
  public sendCode = async (req: Request, res: Response<ApiResponse<undefined>>): Promise<void> => {
    console.debug('using email ' + process.env.MAIL_USER)
    const { email } = req.body as { email: string }
    if (!email) {
      res.status(400).json({ success: false, message: '邮箱不能为空' });
      return
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 5 * 60 * 1000; // 5分钟过期

    // 存储验证码
    this.verificationCodes.set(email, { code, expires });

    try {
      // 发送邮件
      await this.transporter.sendMail({
        from: `"Woisol-G" <${process.env.MAIL_USER}>`, // 必须使用认证的邮箱地址
        to: email,
        subject: '登录验证码',
        html: `
          <h2>登录验证码</h2>
          <p>您的验证码是：<strong style="font-size: 24px; color: #007bff;">${code}</strong></p>
          <p>验证码有效期为5分钟，请及时使用。</p>
        `
      });

      res.status(201).json({ success: true, message: '验证码已发送到您的邮箱' });
    } catch (error) {
      console.error('发送邮件失败:', error);
      res.status(500).json({ success: false, message: '发送验证码失败' });
    }
  }
  public verifyCode = async (req: Request, res: Response<ApiResponse<undefined>>): Promise<void> => {

  }
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
import { Request, Response } from 'express';
import { UserService } from '../services/userService';
import { User } from '../models/user';
import { hashPassword, comparePassword } from '../utils/password';
import jwt from 'jsonwebtoken';

export class AuthController {
    private userService: UserService;

    constructor() {
        this.userService = new UserService();
    }

    public async register(req: Request, res: Response): Promise<void> {
        const { username, password } = req.body;

        const hashedPassword = await hashPassword(password);
        const user = new User(username, hashedPassword);

        try {
            await this.userService.createUser(user);
            res.status(201).json({ message: 'User registered successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error registering user', error });
        }
    }

    public async login(req: Request, res: Response): Promise<void> {
        const { username, password } = req.body;

        try {
            const user = await this.userService.getUserByUsername(username);
            if (!user) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const isMatch = await comparePassword(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
            res.status(200).json({ token });
        } catch (error) {
            res.status(500).json({ message: 'Error logging in', error });
        }
    }
}
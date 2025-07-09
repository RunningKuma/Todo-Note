"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const userService_1 = require("../services/userService");
const todoService_1 = require("../services/todoService");
const password_1 = require("../utils/password");
const jwt_1 = require("@server/utils/jwt");
class AuthController {
    constructor() {
        //! 使用 成员定义 会导致 express 路由处理器中的 this 绑定丢失为 undefined
        // public async register(req: Request, res: Response): Promise<void> {
        this.register = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { email, username, password } = req.body;
            //@todo 传过来的 password 不应是明文
            const hashedPassword = yield (0, password_1.hashPassword)(password);
            try {
                const userData = yield this.userService.createUser(email, username, hashedPassword);
                res.status(201).json({ message: 'User registered successfully', user: userData }).send();
            }
            catch (error) {
                console.error('Error registering user:', error);
                //@dtodo implement error type
                if (error.code === 'SQLITE_CONSTRAINT') {
                    res.status(400).json({ message: 'User already exists' }).send();
                    return;
                }
                res.status(500).json({ message: 'Error registering user: ' + error }).send();
            }
        });
        this.login = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { email, password } = req.body;
            try {
                const user = yield this.userService.getUserByEmail(email);
                if (!user) {
                    res.status(401).json({ message: 'User not found' }).send();
                    return;
                }
                // getLoginOptions
                if (password === undefined) {
                    res.status(201).send();
                    return;
                }
                const isMatch = yield (0, password_1.comparePassword)(password, user.password);
                if (!isMatch) {
                    res.status(401).json({ message: 'Incorrect password.' }).send();
                    return;
                } //@todo implement jwt secret in env
                if (!process.env.JWT_SECRET) {
                    console.warn('JWT_SECRET is not set.');
                }
                //@todo expire？
                const token = (0, jwt_1.generateToken)(user.id);
                res.header('Authorization', `Bearer ${token}`);
                // 获取用户的TODO列表
                const userTodos = yield this.todoService.getUserTodos(user.id);
                res.status(200).json({ userData: { id: user.id, email: user.email, username: user.username, todo: userTodos }, message: '' }).send();
            }
            catch (error) {
                console.error('Error logging in:', error);
                res.status(500).json({ message: 'Error logging in', error }).send();
            }
        });
        this.manualCheck = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
            if (!token) {
                res.status(401).json({ message: 'No token provided' }).send();
                return;
            }
            try {
                const decoded = (0, jwt_1.verifyToken)(token);
                if (!decoded || !decoded.id) {
                    res.status(401).json({ message: 'Invalid token' }).send();
                    return;
                }
                const user = yield this.userService.getUserById(decoded.id);
                if (!user) {
                    res.status(401).json({ message: 'Invalid token' }).send();
                    return;
                }
                res.status(200).send();
            }
            catch (error) {
                console.error('Error verifying token:', error);
                res.status(401).json({ message: 'Invalid token', error }).send();
            }
        });
        this.userService = new userService_1.UserService();
        this.todoService = new todoService_1.TodoService();
    }
}
exports.AuthController = AuthController;

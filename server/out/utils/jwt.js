"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
//@todo implement env
const SECRET_KEY = process.env.JWT_SECRET || 'secret_key';
//! 明文？：https://www.bilibili.com/video/BV1XCjPz4EVd
const generateToken = (userId) => {
    return jsonwebtoken_1.default.sign({ id: userId }, SECRET_KEY, { expiresIn: '1h' });
};
exports.generateToken = generateToken;
const verifyToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, SECRET_KEY);
    }
    catch (error) {
        return null;
    }
};
exports.verifyToken = verifyToken;

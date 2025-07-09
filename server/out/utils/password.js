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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.comparePassword = comparePassword;
const bcrypt_1 = __importDefault(require("bcrypt"));
const SALT_ROUNDS = 10;
/**
 * 对密码进行加密
 * @param password 原始密码
 * @returns 加密后的密码
 */
function hashPassword(password) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const salt = yield bcrypt_1.default.genSalt(SALT_ROUNDS);
            const hashedPassword = yield bcrypt_1.default.hash(password, salt);
            return hashedPassword;
        }
        catch (error) {
            console.error('密码加密失败:', error);
            throw new Error('密码加密失败');
        }
    });
}
/**
 * 验证密码是否正确
 * @param password 原始密码
 * @param hashedPassword 加密后的密码
 * @returns 密码是否匹配
 */
function comparePassword(password, hashedPassword) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield bcrypt_1.default.compare(password, hashedPassword);
        }
        catch (error) {
            console.error('密码验证失败:', error);
            throw new Error('密码验证失败');
        }
    });
}

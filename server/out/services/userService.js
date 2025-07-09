"use strict";
// src/services/userService.ts
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
exports.UserService = void 0;
const crypto_1 = require("crypto");
const user_1 = require("../models/user");
class UserService {
    constructor() {
        user_1.User.createTable();
    }
    createUser(email, username, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = (0, crypto_1.randomUUID)();
            yield user_1.User.create(id, email, username, password);
            return yield user_1.User.findUser.findById(id);
        });
    }
    getUserById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield user_1.User.findUser.findById(id);
        });
    }
    getUserByUsername(username) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield user_1.User.findUser.findByUsername(username);
        });
    }
    getUserByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield user_1.User.findUser.findByEmail(email);
        });
    }
}
exports.UserService = UserService;

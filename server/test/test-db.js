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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
// 测试数据库连接和创建功能
var database_1 = require("../src/config/database");
function testDatabaseConnection() {
    return __awaiter(this, void 0, void 0, function () {
        var result, userTableInfo, todoTableInfo, noteTableInfo, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, 7, 9]);
                    console.log('=== 数据库连接测试开始 ===');
                    // 测试连接
                    return [4 /*yield*/, database_1.db.connect()];
                case 1:
                    // 测试连接
                    _a.sent();
                    console.log('✅ 数据库连接测试成功');
                    return [4 /*yield*/, database_1.db.query('SELECT name FROM sqlite_master WHERE type="table"')];
                case 2:
                    result = _a.sent();
                    console.log('📋 数据库表列表:', result);
                    return [4 /*yield*/, database_1.db.query('PRAGMA table_info(users)')];
                case 3:
                    userTableInfo = _a.sent();
                    console.log('👤 用户表结构:', userTableInfo);
                    return [4 /*yield*/, database_1.db.query('PRAGMA table_info(todos)')];
                case 4:
                    todoTableInfo = _a.sent();
                    console.log('📝 TODO表结构:', todoTableInfo);
                    return [4 /*yield*/, database_1.db.query('PRAGMA table_info(notes)')];
                case 5:
                    noteTableInfo = _a.sent();
                    console.log('📄 笔记表结构:', noteTableInfo);
                    console.log('=== 数据库连接测试完成 ===');
                    return [3 /*break*/, 9];
                case 6:
                    error_1 = _a.sent();
                    console.error('❌ 数据库连接测试失败:', error_1);
                    return [3 /*break*/, 9];
                case 7: return [4 /*yield*/, database_1.db.close()];
                case 8:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 9: return [2 /*return*/];
            }
        });
    });
}
// 运行测试
testDatabaseConnection();

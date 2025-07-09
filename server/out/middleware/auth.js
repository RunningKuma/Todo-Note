"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const jwt_1 = require("../utils/jwt");
const authenticateToken = (req, res, next) => {
    var _a;
    const token = (_a = req.headers['authorization']) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
    if (!token) {
        res.status(401).json({ success: false, message: 'No token provided' });
        return;
    }
    try {
        const decoded = (0, jwt_1.verifyToken)(token);
        if (!decoded || !decoded.id) {
            res.status(401).json({ success: false, message: 'Invalid token' });
            return;
        }
        //! 请求并没有传输 user，是通过这里加进去的()
        req.user = { id: decoded.id };
        next();
    }
    catch (error) {
        res.status(403).json({ success: false, message: 'Token verification failed' });
        return;
    }
};
exports.authenticateToken = authenticateToken;

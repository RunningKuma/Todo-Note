import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

export interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    res.status(401).json({ success: false, message: 'No token provided' });
    return;
  }

  try {
    const decoded = verifyToken(token) as { id: string };
    if (!decoded || !decoded.id) {
      res.status(401).json({ success: false, message: 'Invalid token' });
      return;
    }

    //! 请求并没有传输 user，是通过这里加进去的()
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    res.status(403).json({ success: false, message: 'Token verification failed' });
    return;
  }
};
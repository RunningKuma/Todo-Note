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
    
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    res.status(403).json({ success: false, message: 'Token verification failed' });
    return;
  }
};
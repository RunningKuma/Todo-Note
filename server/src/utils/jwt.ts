import jwt from 'jsonwebtoken';

//@todo implement env
const SECRET_KEY = process.env.JWT_SECRET || 'secret_key';

//! 明文？：https://www.bilibili.com/video/BV1XCjPz4EVd
export const generateToken = (userId: string) => {
  return jwt.sign({ id: userId }, SECRET_KEY, { expiresIn: '1d' });
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (error) {
    return null;
  }
};
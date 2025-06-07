import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

/**
 * 对密码进行加密
 * @param password 原始密码
 * @returns 加密后的密码
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    console.error('密码加密失败:', error);
    throw new Error('密码加密失败');
  }
}

/**
 * 验证密码是否正确
 * @param password 原始密码
 * @param hashedPassword 加密后的密码
 * @returns 密码是否匹配
 */
export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    console.error('密码验证失败:', error);
    throw new Error('密码验证失败');
  }
}
# 现代 Web 应用认证最佳实践

## 概述

本文档说明了在现代 Web 应用中处理用户认证和数据存储的最佳实践。

## 1. Token 存储策略

### 推荐方案一：HttpOnly Cookie（最安全）
```javascript
// 服务端设置（Express 示例）
res.cookie('auth_token', token, {
  httpOnly: true,    // 防止 XSS 攻击
  secure: true,      // 仅 HTTPS
  sameSite: 'strict', // 防止 CSRF 攻击
  maxAge: 24 * 60 * 60 * 1000 // 24小时
});
```

**优点：**
- 最高安全性，防止 XSS 攻击
- 自动包含在请求中
- 可设置过期时间

**缺点：**
- 前端无法直接访问
- 需要额外的 CSRF 保护

### 推荐方案二：前端 Cookie（次优选择）
```javascript
// 我们当前的实现
setCookie(COOKIE_NAMES.TOKEN, token, {
  expires: 1,           // 1天过期
  secure: true,         // 仅 HTTPS
  sameSite: 'Lax'      // 平衡安全性和可用性
});
```

**优点：**
- 前端可以控制
- 相对安全
- 自动过期

**缺点：**
- 可能被 XSS 攻击获取
- 需要前端处理

### 不推荐方案：localStorage
```javascript
// 不推荐
localStorage.setItem('token', token);
```

**问题：**
- 容易被 XSS 攻击
- 没有自动过期
- 需要手动清理

## 2. 用户数据存储策略

### ✅ 推荐做法
- **内存存储**：用户数据只在应用运行期间保存在内存中
- **按需获取**：页面刷新后从服务器重新获取用户数据
- **缓存优化**：可以使用适当的缓存策略

```javascript
// 当前实现
let _userData: UserData | undefined;

// 从服务器获取用户数据
const fetchUserData = async () => {
  const response = await fetch('/api/user/profile', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};
```

### ❌ 不推荐做法
- **Cookie 存储**：用户数据不应存储在 cookie 中
- **localStorage 存储**：敏感用户数据不应长期存储在客户端

**原因：**
- Cookie 大小限制（4KB）
- 增加网络传输开销
- 安全风险
- 数据同步问题

## 3. 安全考虑

### XSS 防护
- 使用 httpOnly cookie 存储敏感 token
- 对用户输入进行适当的转义和验证
- 使用 Content Security Policy (CSP)

### CSRF 防护
- 使用 sameSite cookie 属性
- 实施 CSRF token 机制
- 验证 Referer 头

### Token 管理
- 设置合理的过期时间
- 实施 token 刷新机制
- 提供安全的登出功能

## 4. 实现建议

### 前端
```javascript
export const authService = {
  // 检查认证状态
  isAuthenticated: () => !!getCookie('auth_token'),

  // 获取用户数据（优先从内存，否则从服务器）
  getUserData: async () => {
    if (!_userData) {
      _userData = await fetchUserData();
    }
    return _userData;
  },

  // 登出
  logout: () => {
    _userData = undefined;
    removeCookie('auth_token');
    // 重定向到登录页
  }
};
```

### 后端
```javascript
// 设置安全的 cookie
app.post('/api/auth/login', (req, res) => {
  const token = generateToken(user);

  res.cookie('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000
  });

  res.json({
    success: true,
    user: sanitizeUserData(user) // 只返回必要的用户信息
  });
});
```

## 5. 总结

现代 Web 应用的认证最佳实践：

1. **Token 存储**：优先使用 httpOnly cookie，次选前端 cookie
2. **用户数据**：内存存储，按需从服务器获取
3. **安全性**：多层防护，包括 XSS、CSRF 等
4. **用户体验**：平衡安全性和便利性

这种方式既保证了安全性，又提供了良好的用户体验。

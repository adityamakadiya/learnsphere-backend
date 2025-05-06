const { authService } = require('../services/authService');

const register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { accessToken, refreshToken, user } = await authService.login(req.body);
    console.log("auth/login: Setting cookies for user:", user.id); // Debug
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 20 * 60 * 1000, // 20 minutes
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    res.json({ user }); // Only send user data
  } catch (err) {
    console.error("auth/login: Error:", err.message, err.stack); // Debug
    next(err);
  }
};

const refresh = async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;
  console.log('auth/refresh: Received refreshToken:', !!refreshToken); // Debug
  if (!refreshToken) {
    console.log('auth/refresh: No refresh token provided');
    return res.status(401).json({ error: 'No refresh token provided' });
  }
  try {
    const { accessToken, user } = await authService.refresh(refreshToken);
    console.log('auth/refresh: New accessToken generated for user:', user.id); // Debug
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 20 * 60 * 1000,
    });
    res.json({ user });
  } catch (err) {
    console.error('auth/refresh: Error:', err.message, err.stack); // Debug
    next(err);
  }
};

const logout = async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;
  console.log('auth/logout: Received refreshToken:', !!refreshToken); // Debug
  try {
    await authService.logout(refreshToken);
    console.log('auth/logout: Refresh token deleted'); // Debug
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('auth/logout: Error:', err.message, err.stack); // Debug
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.id);
    console.log('auth/me: Returning user:', user.id); // Debug
    res.json(user);
  } catch (err) {
    console.error('auth/me: Error:', err.message, err.stack); // Debug
    next(err);
  }
};

const googleLogin = async (req, res, next) => {
  const { idToken } = req.body;
  console.log('auth/googleLogin: Received idToken:', !!idToken);
  if (!idToken) {
    console.log('auth/googleLogin: No ID token provided');
    return res.status(400).json({ error: 'No ID token provided' });
  }
  try {
    const { accessToken, refreshToken, user } = await authService.googleLogin(idToken);
    console.log('auth/googleLogin: Setting cookies for user:', user.id);
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 20 * 60 * 1000, // 20 minutes
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    res.json({ user });
  } catch (err) {
    console.error('auth/googleLogin: Error:', err.message, err.stack);
    next(err);
  }
};

module.exports = { register, login, getMe, refresh, logout, googleLogin };
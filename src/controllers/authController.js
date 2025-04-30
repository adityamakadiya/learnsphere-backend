const { authService } = require('../services/authService');

const register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);
    // console.log(user);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  // try {
  //   const { token, user } = await authService.login(req.body);
  //   res.json({ token, user });
  // } catch (err) {
  //   next(err);
  // }
  try {
    const { accessToken, refreshToken, user } = await authService.login(req.body);
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 20 * 60 * 1000, // 20 minutes
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    res.json({ accessToken, refreshToken,user });
  } catch (err) {
    next(err);
  }
};

const refresh = async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;
  console.log('Refresh: Received refreshToken:', refreshToken); // Debug
  if (!refreshToken) {
    console.log('Refresh: No refresh token provided');
    return res.status(401).json({ error: 'No refresh token provided' });
  }
  try {
    const { accessToken, user } = await authService.refresh(refreshToken);
    console.log('Refresh: New accessToken generated'); // Debug
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 20 * 60 * 1000,
    });
    res.json({ user });
  } catch (err) {
    console.error('Refresh Error:', err); // Debug
    next(err);
  }
};

const logout = async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;
  console.log('Logout: Received refreshToken:', refreshToken); // Debug
  try {
    await authService.logout(refreshToken);
    console.log('Logout: Refresh token deleted'); // Debug
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout Error:', err); // Debug
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.id);
    res.json(user);
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe, refresh, logout };
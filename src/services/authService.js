const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');
const { jwtSecret, refreshTokenSecret } = require('../config/index');

const register = async ({ email, password, role }) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    const error = new Error('Email already exists');
    error.status = 400;
    throw error;
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, password: hashedPassword, role: role || 'Student' },
  });
  console.log('authService/register: Created user:', user.id); // Debug
  return { id: user.id, email: user.email, role: user.role };
};

const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const error = new Error('Invalid credentials');
    error.status = 401;
    throw error;
  }
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    const error = new Error('Invalid credentials');
    error.status = 401;
    throw error;
  }

  const accessToken = jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    jwtSecret,
    { expiresIn: '20m' }
  );
  const refreshToken = jwt.sign(
    { id: user.id }, // Include userId
    refreshTokenSecret,
    { expiresIn: '7d' }
  );
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });
  console.log('authService/login: Generated tokens for user:', user.id); // Debug
  return {
    accessToken,
    refreshToken,
    user: { id: user.id, email: user.email, role: user.role },
  };
};

const refresh = async (refreshToken) => {
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
  });
  if (!storedToken || storedToken.expiresAt < new Date()) {
    const error = new Error('Invalid or expired refresh token');
    error.status = 401;
    throw error;
  }
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, refreshTokenSecret);
  } catch (error) {
    const err = new Error('Invalid refresh token');
    err.status = 401;
    throw err;
  }
  const user = await prisma.user.findUnique({
    where: { id: storedToken.userId },
  });
  if (!user || user.id !== decoded.id) {
    const error = new Error('User not found or invalid token');
    error.status = 401;
    throw error;
  }
  const accessToken = jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    jwtSecret,
    { expiresIn: '20m' }
  );
  console.log('authService/refresh: Refreshed accessToken for user:', user.id); // Debug
  return {
    accessToken,
    user: { id: user.id, email: user.email, role: user.role },
  };
};

const logout = async (refreshToken) => {
  if (refreshToken) {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    console.log('authService/logout: Deleted refreshToken'); // Debug
  }
};

const getMe = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, role: true },
  });
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }
  console.log('authService/getMe: Fetched user:', user.id); // Debug
  return user;
};

module.exports = { authService: { register, login, getMe, logout, refresh } };
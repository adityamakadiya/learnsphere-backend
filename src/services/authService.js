const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');
const { jwtSecret, refreshTokenSecret } = require('../config/index');

const register = async ({ email, password, role }) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  const users = await prisma.user.findMany();
  console.log(users);
  
  if (existingUser) {
    throw new Error('Email already exists');
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, password: hashedPassword, role: role || 'Student' },
  });
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
    { expiresIn: '15m' }
  );
  const refreshToken = jwt.sign({}, refreshTokenSecret, { expiresIn: '7d' });
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

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
  try {
    jwt.verify(refreshToken, refreshTokenSecret);
  } catch (error) {
    const err = new Error('Invalid refresh token');
    err.status = 401;
    throw err;
  }
  const user = await prisma.user.findUnique({
    where: { id: storedToken.userId },
  });
  if (!user) {
    const error = new Error('User not found');
    error.status = 401;
    throw error;
  }
  const accessToken = jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    jwtSecret,
    { expiresIn: '20m' }
  );
  return {
    accessToken,
    refreshToken, // Reuse existing refresh token
    user: { id: user.id, email: user.email, role: user.role },
  };
};

const logout = async (refreshToken) => {
  if (refreshToken) {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
  }
};

const getMe = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, role: true },
  });
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};

module.exports = { authService: { register, login, getMe, logout, refresh } };
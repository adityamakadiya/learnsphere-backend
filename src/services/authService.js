const { OAuth2Client } = require("google-auth-library");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');
const { jwtSecret, refreshTokenSecret, GOOGLE_CLIENT_ID } = require('../config/index');
const client = new OAuth2Client(GOOGLE_CLIENT_ID);
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    jwtSecret,
    { expiresIn: '20m' }
  );
  const refreshToken = jwt.sign(
    { id: user.id },
    refreshTokenSecret,
    { expiresIn: '7d' }
  );
  return { accessToken, refreshToken };
};
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
  const { accessToken, refreshToken } = generateTokens(user);
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
  console.log("authService/refresh: Processing refresh token");

  // Find stored refresh token
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
  });
  if (!storedToken || storedToken.expiresAt < new Date()) {
    if (storedToken) {
      await prisma.refreshToken.delete({ where: { token: refreshToken } });
    }
    const error = new Error("Invalid or expired refresh token");
    error.status = 401;
    throw error;
  }

  // Verify JWT
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, refreshTokenSecret);
  } catch (error) {
    await prisma.refreshToken.delete({ where: { token: refreshToken } });
    const err = new Error("Invalid refresh token");
    err.status = 401;
    throw err;
  }

  // Find user
  const user = await prisma.user.findUnique({
    where: { id: storedToken.userId },
  });
  if (!user || user.id !== decoded.id) {
    await prisma.refreshToken.delete({ where: { token: refreshToken } });
    const error = new Error("User not found or invalid token");
    error.status = 401;
    throw error;
  }

  // Generate new tokens
  const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

  // Update refresh token in database
  await prisma.refreshToken.delete({ where: { token: refreshToken } });
  await prisma.refreshToken.create({
    data: {
      token: newRefreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  // console.log("authService/refresh: Refreshed tokens for user:", user.id);
  return {
    token: accessToken,
    newRefreshToken,
    user: { id: user.id, email: user.email, role: user.role },
  };
};

const logout = async (refreshToken) => {
  if (refreshToken) {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    // console.log('authService/logout: Deleted refreshToken'); // Debug
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
  // console.log('authService/getMe: Fetched user:', user.id); // Debug
  return user;
};
const googleLogin = async (idToken) => {
  try {
    // console.log("authService/googleLogin: Verifying token"); // Debug
    const ticket = await client.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const googleId = payload.sub;
    const email = payload.email;
    // console.log("authService/googleLogin: Payload:", { googleId, email }); // Debug
    let user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { email },
          data: { googleId },
        });
        // console.log("authService/googleLogin: Linked googleId to existing user:", user); // Debug
      }
    } else {
      user = await prisma.user.create({
        data: {
          email,
          googleId,
          password: null,
          role: "Student",
        },
      });
      console.log("authService/googleLogin: Created user:", user); // Debug
    }
    const { accessToken, refreshToken } = generateTokens(user);
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
    console.log("authService/googleLogin: Generated tokens:", { accessToken, refreshToken }); // Debug
    return {
      user: { id: user.id, email: user.email, role: user.role },
      accessToken,
      refreshToken
    };
  } catch (error) {
    console.error("authService/googleLogin: Error:", error.message); // Debug
    throw new Error("Invalid Google token");
  }
};
module.exports = { authService: { register, login, getMe, logout, refresh, googleLogin } };
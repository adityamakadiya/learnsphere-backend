const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');
const { jwtSecret } = require('../config/index')

const register = async ({ email, password, role}) => {
  const existingUser = await prisma.user.findUnique({where: { email }});
  if(existingUser) {
    throw new Error('Email is already exists');
  }
  const hashedPass = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPass,
      role:role || 'Student'
    }
  });
  
  return { id: user.id, email: user.email, role: user.role };
};

const login = async({email,password}) => {
  const user = await prisma.user.findUnique({where: {email}});
  if(!user) {
    throw new Error ('Invalid Credentials');
  }
  const token = jwt.sign ({id: user.id , role: user.role}, jwtSecret,{
    expiresIn: '2d',
  });
  return { token, user: { id: user.id, email: user.email, role: user.role } };
}

module.exports = { authService: { register, login } };
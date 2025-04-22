require('dotenv').config();

module.exports = {
  jwtSecret: process.env.JWT_SECRET,
  port: process.env.PORT || 5000,
};
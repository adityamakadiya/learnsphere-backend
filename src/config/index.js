require('dotenv').config();

module.exports = {
  jwtSecret: process.env.JWT_SECRET,
  port: process.env.PORT || 5000,
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
};
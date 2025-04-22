const logger = require('./logger');

const errorHandler = (err, req, res, next) => {
  logger.error(err.message);
  if (err.message === 'Email already exists' || err.message === 'Invalid credentials') {
    return res.status(400).json({ error: err.message });
  }
  res.status(500).json({ error: 'Server error' });
};

module.exports = { errorHandler };
const { check, validationResult } = require('express-validator');

const validateRegister = [
  check('email').isEmail().withMessage('Valid email is required'),
  check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

const validateLogin = [
  check('email').isEmail().withMessage('Valid email is required'),
  check('password').notEmpty().withMessage('Password is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

const validateRating = (req, res, next) => {
  const { stars, review } = req.body;
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
    return res.status(400).json({ error: 'Stars must be an integer between 1 and 5' });
  }
  if (review && review.trim().length < 50) {
    return res.status(400).json({ error: 'Review must be at least 50 characters' });
  }
  next();
};

const validateComment = (req, res, next) => {
  const { content } = req.body;
  if (!content || content.trim().length < 5) {
    return res.status(400).json({ error: 'Comment must be at least 5 characters' });
  }
  next();
};

module.exports = { validateRegister, validateLogin, validateComment,validateRating };
const express = require('express');
const { register, login, refresh, logout, getMe } = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../middleware/validator');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', auth, getMe);

module.exports = router;
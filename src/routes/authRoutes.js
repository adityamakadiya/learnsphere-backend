const express = require('express');
const { register, login, refresh, logout, getMe, googleLogin } = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../middleware/validator');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', auth, getMe);
router.post('/google', googleLogin);

module.exports = router;
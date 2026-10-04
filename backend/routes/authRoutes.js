const express = require('express');
const auth = require('../middleware/auth');
const ctrl = require('../controllers/authController');

const router = express.Router();

router.post('/register', ctrl.register);
router.post('/verify-email', ctrl.verifyEmail);
router.post('/login', ctrl.login);
router.post('/resend-otp', ctrl.resendOtp);
router.post('/forgot-password', ctrl.forgotPassword);
router.post('/reset-password', ctrl.resetPassword);

router.get('/me', auth, ctrl.me);
router.put('/password', auth, ctrl.changePassword);

module.exports = router;

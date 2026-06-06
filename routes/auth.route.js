const express = require("express");
const router  = express.Router();

const authController = require('../controllers/auth.controller');

router.get('/login',authController.getLogin);
router.get('/signup',authController.getSignup);
router.get('/reset-password',authController.getResetPass);
router.get('/reset-password/:token',authController.getUpdatePassword);
router.post('/login',authController.postLogin);
router.post('/signup',authController.postSignup);
router.post('/logout',authController.postLogout);
router.post('/reset-password',authController.postResetPass);
router.post('/update-password',authController.postUpdatePassword);

module.exports = router;
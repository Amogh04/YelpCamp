const express = require('express');
const router = express.Router();
const catchAsync = require('../utilities/catchAsync');
const passport = require('passport');
const {checkLogin, redirectTo} = require('../utilities/middleware');
const users = require('../controllers/users')



router.route('/register')
    .get((req, res) => res.render('users/register', {sendOTP:false}))
    .post(catchAsync(users.verifyEmail))
    
router.post('/register/verify', catchAsync(users.registerNewUser));

// This middleware is what Logs in the user!
const passportMiddleware = passport.authenticate('local', {failureFlash:true, failureRedirect:'/u/login'})

router.route('/login')
    .get((req, res) => res.render('users/login'))
    .post(redirectTo, passportMiddleware, users.login)
router.get('/logout', users.logout)

router.get('/settings/manage', checkLogin, (req, res) => (res.render('users/manage')));

router.post('/settings/editEmail', checkLogin, users.changeEmail);
router.get('/settings', checkLogin, (req, res) => (res.render('users/profile', {sendOTP:false})));
router.post('/changePwd', checkLogin, users.changePwd);
router.post('/editUser', checkLogin, users.editUser);
router.delete('/', checkLogin, users.deleteAcc);

router.route('/forgot')
    .get((req, res) => (res.render('users/forgot', {sendOTP:false})))
    .post(users.forgotUsername);
router.post('/forgot/updatePwd', users.updatePwd);

module.exports = router;
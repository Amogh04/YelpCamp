const express = require('express');
const router = express.Router();
const User = require('../models/user');
const catchAsync = require('../utilities/catchAsync');
const passport = require('passport');
const {checkLogin, redirectTo} = require('../utilities/middleware');

router.get('/register', (req, res) => {
    res.render('users/register');
})

router.post('/register', catchAsync(async (req,res) => {
    let newUser;
    try{
        const {username, email, password} = req.body.user;
        const user = new User({email, username});
        newUser = await User.register(user, password);
        await newUser.save();
        req.login(newUser, err => {
            if(err) return next(err);
            req.flash('success', 'Welcome to YelpCamp. You are successfully registered!');
            res.redirect('/campgrounds');
        });
    }
    catch(err){
        req.flash('error', err.message);
        return res.redirect('/u/register');
    }
}))

router.get('/login', (req, res) => {
    res.render('users/login');
});

// This middleware is what Logs in the user!
const passportMiddleware = passport.authenticate('local', {failureFlash:true, failureRedirect:'/u/login'})
router.post('/login', redirectTo, passportMiddleware, (req, res) => {
    const redirectUrl = res.locals.redirectTo || '/campgrounds';
    req.flash('success', 'Logged in!');
    res.redirect(redirectUrl);
}); 

router.get('/logout', (req, res, next) => {
    req.logout( function (err) {
        if(err)
            return next(err);
        req.flash('success', 'GoodBye!');
        res.redirect('/');
    });
    
})

module.exports = router;
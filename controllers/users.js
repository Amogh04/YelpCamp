const User = require('../models/user');

module.exports.registerNewUser = async (req,res) => {
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
}

module.exports.login = (req, res) => {
    const redirectUrl = res.locals.redirectTo || '/campgrounds';
    req.flash('success', 'Logged in!');
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res, next) => {
    req.logout( function (err) {
        if(err)
            return next(err);
        req.flash('success', 'GoodBye!');
        res.redirect('/');
    });
}
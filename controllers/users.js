const Campground = require('../models/campground');
const User = require('../models/user');
const Review = require('../models/review');

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

module.exports.changePwd = async (req, res, next) => {
    const user = await User.findOne({_id:res.locals.currentUser._id});
    user.changePassword(req.body.currPwd, req.body.newPwd, (err, user, passwordErr) => {
        if(passwordErr || err){
            req.flash('error', (passwordErr || err).message);
            return res.redirect('/u/settings');
        }
        else{
            req.flash('success', 'Password Changed Successfully');
            return res.redirect('/u/settings');
        }
    })
}

module.exports.deleteAcc = async (req, res, next) => {
    const {currPwd, confirm} = req.body;
    const id = res.locals.currentUser._id;
    const user = await User.findById(id);
    user.authenticate(currPwd, async (err, authenticatedUser, error) => {
        if(authenticatedUser && confirm==="Delete this account"){
            await Review.deleteMany({_id: {$in: user.reviews}});
            await Campground.deleteMany({_id: {$in: user.campgrounds}});
            await user.deleteOne();
            req.flash('success', 'Successfully deleted the Account');
            res.redirect('/');
        }
        else{
            req.flash('error', 'Unable to Authenticate. Please try again!');
            res.redirect('/u/settings');
        }
    });
}

module.exports.editUser = async (req, res, next) => {
    const {name, email, username} = req.body;
    console.log('req.body: ', req.body);
    const oldUsername = await User.find({username});
    const oldEmail = await User.find({email});
    if(oldUsername.length){
        req.flash('error', 'This username is taken! Please try another');
        return res.redirect('/u/settings');
    }
    else if(oldEmail.length){
        req.flash('error', 'A user with this Email address already exists!');
        return res.redirect('/u/settings');
    }
    else{
        const user = await User.findById(res.locals.currentUser._id);
        user.name = name;
        user.email = email;
        user.username = username;
        await user.save();
        req.login(user, function(err) {
            if (err) return next(err);
            req.flash('success', 'Changes Saved!');
            res.redirect('/u/settings');
        });
    }
}
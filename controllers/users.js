const Campground = require('../models/campground');
const User = require('../models/user');
const Review = require('../models/review');
const { cloudinary } = require('../cloudinary');

const MagicLinkStrategy = require('passport-magic-link').Strategy;
const sendgrid = require('@sendgrid/mail');
sendgrid.setApiKey(process.env['SENDGRID_API_KEY']);
const randomstring = require('randomstring');

async function sendEmail(to, msg) {
	const msgData = {
		to,
		from: process.env.EMAIL,
		subject: 'OTP Verification for YelpCamp',
		html: msg
	};
	try{
		await sendgrid.send(msgData);
	}
	catch(e){
		console.log('error: ', e);
	}
}

module.exports.verifyEmail = async(req, res) => {
    const {user} = req.body;
    const email = user.email;
    const otp = randomstring.generate(6);
    const msg = 'Your OTP is ' + otp;
    sendEmail(email, msg);
    req.session.otp = otp;
    req.session.user = user;
    res.render('users/register', {sendOTP:true});
}


module.exports.registerNewUser = async (req,res) => {
    if(req.body && req.body.otp==`${req.session.otp}`){
        let newUser;
        try{
            const {username, email, password} = req.session.user;
            const user = new User({email, username});
            newUser = await User.register(user, password);
            const resp = await newUser.save();
            req.login(newUser, err => {
                if(err) return next(err);
                req.session.newUser = null;
                req.flash('success', 'Welcome to YelpCamp. You are successfully registered!');
                return res.redirect('/campgrounds');
            });
        }
        catch(err){
            req.flash('error', err.message);
            return res.redirect('/u/register');
        }
    }
    else{
        req.flash('error', 'Invalid OTP entered! Try again');
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
    });
}

module.exports.deleteAcc = async (req, res, next) => {
    const {currPwd, confirm} = req.body;
    const id = res.locals.currentUser._id;
    const user = await User.findById(id);
    user.authenticate(currPwd, async (err, authenticatedUser, error) => {
        if(authenticatedUser && confirm==="Delete this account"){
            const camps = await Campground.find({_id: {$in: user.campgrounds}});
            for( let camp of camps){
                for (let img of camp.images) {
                    console.log(img, img.filename);
                    await cloudinary.uploader.destroy(img.filename);
                }
            }
            await Review.deleteMany({_id: {$in: user.reviews}});
            await Campground.deleteMany({_id: {$in: user.campgrounds}});
            await user.deleteOne();
            req.flash('success', 'Successfully deleted the Account');
            return res.redirect('/');
        }
        else{
            req.flash('error', 'Unable to Authenticate. Please try again!');
            return res.redirect('/u/settings/manage');
        }
    });
}

module.exports.changeEmail = async (req, res, next) => {
    const email = req.session.newEmail;
    const user = await User.findById(req.user._id);
    if(`${req.body.otp}`!==req.session.otp){
        req.flash('error', 'Invalid OTP Entered. Sent again!');
        res.locals.error = req.flash('error');
        sendOTP(req, user);   
        return res.render('users/profile', {sendOTP:true});
    }
    user.email = email;
    user.save();
    req.login(user, function(err) {
        if (err) return next(err);
    });
    req.flash('success', 'Email Changed Successfully!');
    req.session.otp = null;
    req.session.newEmail = null;
    res.locals.sendOTP = false;
    return res.redirect('/u/settings');
}

module.exports.editUser = async (req, res, next) => {
    const {name, email, username} = req.body;
    console.log('req.body: ', req.body);
    const oldUsername = await User.find({username});
    const oldEmail = await User.find({email});
    if(oldUsername.length && oldUsername[0]._id.toString()!==req.user._id.toString()){
        req.flash('error', 'This username is taken! Please try another');
        return res.redirect('/u/settings');
    }
    else if(oldEmail.length && oldEmail[0]._id.toString()!==req.user._id.toString()){
        req.flash('error', 'A user with this Email address already exists!');
        return res.redirect('/u/settings');
    }
    else{
        const user = await User.findById(req.user._id);
        user.name = name;
        user.username = username;
        await user.save();
        req.login(user, function(err) {
            if (err) return next(err);
        });
        if(user.email!==email){
            const otp = randomstring.generate(6);
            const msg = '<h3>Your OTP: ' + otp + '<br>Username: ' + username + '</h3'; 
            sendEmail(email, msg);
            req.session.otp = otp;
            req.session.newEmail = email;
            res.locals.sendOTP = true;
            return res.render('users/profile', {sendOTP:true});
        }
        else{
            req.flash('success', 'Changes Saved!');
            return res.redirect('/u/settings');
        }
        // user.email = email;
    }
}

const sendOTP = (req, user, username=null) => {
    const otp = randomstring.generate(6);
    const msg = '<h3>Your OTP: ' + otp + '<br>Username: ' + username + '</h3'; 
    sendEmail(user.email, msg);
    req.session.otp = otp;
    req.session.user = user;
}

module.exports.forgotUsername = async (req, res, next) => {
    const login = req.body.login;
    const user = await User.findOne({$or: [{email:login}, {username:login}]});
    if(!user){
        req.flash('error', 'No user exists with this Email!');
        return res.redirect('/u/forgot')
    }
    req.flash('success', 'OTP has been sent to your Email');
    res.locals.success = req.flash('success');
    sendOTP(req, user, user.username);   
    return res.render('users/forgot', {sendOTP:true});
}

module.exports.updatePwd = async (req, res) => {
    const user = await User.findById(req.session.user._id);
    if(`${req.body.otp}`!==req.session.otp){
        req.flash('error', 'Invalid OTP Entered. Sent again!');
        res.locals.error = req.flash('error');
        sendOTP(req, user);   
        return res.render('users/forgot', {sendOTP:true, username:req.session.user.username});
    }
    user.setPassword(req.body.pwd, (err, user, passwordErr) => {
        if(passwordErr || err){
            req.flash('error', (passwordErr || err).message);
            return res.redirect('/u/forgot');
        }
        else{
            user.save();
            req.flash('success', 'Password Changed Successfully');
            return res.redirect('/');
        }
    })

}
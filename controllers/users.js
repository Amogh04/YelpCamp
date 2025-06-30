const Campground = require('../models/campground');
const User = require('../models/user');
const Review = require('../models/review');

const MagicLinkStrategy = require('passport-magic-link').Strategy;
const sendgrid = require('@sendgrid/mail');
sendgrid.setApiKey(process.env['SENDGRID_API_KEY']);
const randomstring = require('randomstring');

async function sendEmail(to, otp) {
	const msgData = {
		to,
		from: process.env.EMAIL,
		subject: 'OTP Verification for YelpCamp',
		html: `Your OTP is: <h1> ${otp} </h1>`
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
    sendEmail(email, otp);
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
            await Review.deleteMany({_id: {$in: user.reviews}});
            await Campground.deleteMany({_id: {$in: user.campgrounds}});
            await user.deleteOne();
            req.flash('success', 'Successfully deleted the Account');
            res.redirect('/');
        }
        else{
            req.flash('error', 'Unable to Authenticate. Please try again!');
            res.redirect('/u/settings/manage');
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

module.exports.forgotUsername = async (req, res, next) => {
    const login = req.body.login;
    // const user = await User.findOne({email});
    const user = await User.findOne({$or: [{email:login}, {username:login}]});
    if(!user){
        req.flash('error', 'No user exists with this Email!');
        return res.redirect('/u/forgot')
    }
    const otp = randomstring.generate(6);
    sendEmail(user.email, otp);
    req.flash('success', 'OTP has been sent to your Email');
    req.session.otp = otp;
    req.session.user = user;
    return res.render('users/changePwd', {username:user.username});
}

module.exports.updatePwd = async (req, res) => {
    if(`${req.body.otp}`!==req.session.otp){
        req.flash('error', 'Invalid OTP Entered');
        return res.redirect('/u/forgot');
    }
    const user = await User.findById(req.session.user._id);
    user.setPassword(req.body.password, (err, user, passwordErr) => {
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
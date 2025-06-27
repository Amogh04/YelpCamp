const Campground = require('../models/campground');
const Review = require('../models/review')
const mongoose = require('mongoose');

const checkLogin = (req, res, next) => {
    if(req.isUnauthenticated()){
        if(req.method=='POST')
            req.session.redirectTo = '/campgrounds';
        else
            req.session.redirectTo = req.originalUrl;
        req.flash('error', 'You must be Signed in to perform that action!');
        return res.redirect(`/u/login`);
    }
    console.log('body at checklogin middleware: ', req.body)
    next();
}
const redirectTo = (req, res, next) => {
    if(req.session.redirectTo){
        res.locals.redirectTo = req.session.redirectTo;
    }
    next();
}

const isAuthor = async (req, res, next) => {
    const {id, reviewId=null} = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
        req.flash('error', `That's not a valid Campground!`);
        return res.redirect('/campgrounds');
    }
    const camp = await Campground.findById(id);
    if(!camp){
        req.flash('error', `That's not a valid Campground!`);
        return res.redirect('/campgrounds');
    }
    if(reviewId){
        if(!mongoose.Types.ObjectId.isValid(reviewId)){
            req.flash('error', `That's not a valid Review!`);
            return res.redirect(`/campgrounds/${id}`);
        }
        const review = await Review.findById(reviewId);
        if(!review){
            req.flash('error', `That's not a valid Review!`);
            return res.redirect('/campgrounds');
        }
        if(!review.author._id.equals(req.user._id)){
            req.flash('error', 'You do not have permission to do that!');
            return    res.redirect(`/campgrounds/${id}`);
        }
    }
    else if(!camp.author._id.equals(req.user._id)){
        req.flash('error', 'You do not have permission to do that!');
        return    res.redirect(`/campgrounds/${id}`);
    }
    next();
}

module.exports = {checkLogin, redirectTo, isAuthor};
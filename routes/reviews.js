const express = require('express');
const catchAsync = require('../utilities/catchAsync');
const validateReview = require('../utilities/validateReview');
const Campground = require('../models/campground');
const Review = require('../models/review');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const {checkLogin, isAuthor} = require('../utilities/middleware');
const router = express.Router({mergeParams: true});


router.post('/', checkLogin, validateReview, catchAsync(async (req,res) => {
	const campground = await Campground.findById(req.params.id);
	const review = new Review(req.body.review);
	review.author = req.user._id;
	review.dateCreated = Date.now();
	await review.save();
	campground.reviews.push(review);
	await campground.save();
    req.flash('success', 'Successfully created a new review!');
	res.redirect(`/campgrounds/${campground._id}`);
}));
	

router.delete('/:reviewId', checkLogin, isAuthor, catchAsync(async (req,res) =>	 {
	const {id, reviewId} = req.params;
	await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
	await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted the review!');
	res.redirect(`/campgrounds/${id}`);
})); 

module.exports = router;
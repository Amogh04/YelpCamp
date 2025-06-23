const express = require('express');
const catchAsync = require('../utilities/catchAsync');
const validateReview = require('../utilities/validateReview');
const Campground = require('../models/campground');
const Review = require('../models/review');
const mongoose = require('mongoose');
const methodOverride = require('method-override');

const router = express.Router({mergeParams: true});


router.post('/', validateReview, catchAsync(async (req,res) => {
	const campground = await Campground.findById(req.params.id);
	const review = new Review(req.body.review);
	await review.save();
	campground.reviews.push(review);
	await campground.save();
	res.redirect(`/campgrounds/${campground._id}`);
}));
	

router.delete('/:reviewId', catchAsync(async (req,res) =>	 {
	const {id, reviewId} = req.params;
	await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
	await Review.findByIdAndDelete(reviewId);
	res.redirect(`/campgrounds/${id}`);
})); 

module.exports = router;
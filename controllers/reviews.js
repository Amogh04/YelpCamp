const Campground = require('../models/campground');
const Review = require('../models/review');
const User = require('../models/user');
const mongoose = require('mongoose');

module.exports.createReview = async (req,res) => {
	const campground = await Campground.findById(req.params.id);
	const review = new Review(req.body.review);
	review.author = req.user._id;
	const user = await User.findById(req.user._id);
	user.reviews.push(review._id);
	await user.save();
	review.dateCreated = Date.now();
	await review.save();
	campground.reviews.push(review);
	await campground.save();
    req.flash('success', 'Successfully created a new review!');
	res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteReview = async (req,res) =>	 {
	const {id, reviewId} = req.params;
	const review = await Review.findById(reviewId);
	await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
	await User.findByIdAndUpdate(review.author._id, {$pull: {reviews: reviewId}});
	await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted the review!');
	res.redirect(`/campgrounds/${id}`);
}
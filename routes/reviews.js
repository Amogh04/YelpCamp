const express = require('express');
const catchAsync = require('../utilities/catchAsync');
const validateReview = require('../utilities/validateReview');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const {checkLogin, isAuthor} = require('../utilities/middleware');
const router = express.Router({mergeParams: true});
const reviews = require('../controllers/reviews')

router.post('/', checkLogin, validateReview, catchAsync(reviews.createReview));
router.delete('/:reviewId', checkLogin, isAuthor, catchAsync(reviews.deleteReview)); 

module.exports = router;
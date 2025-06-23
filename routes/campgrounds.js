const express = require('express');
const catchAsync = require('../utilities/catchAsync');
const validateCampground = require('../utilities/validateCampground');
const Campground = require('../models/campground');
const mongoose = require('mongoose');
const methodOverride = require('method-override');

const router = express.Router();


router.get('/', catchAsync(async (req,res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index',{campgrounds});
}));

// validateCampground is a MIDDLEWARE FUNCTION that checks if the campground data is valid before proceeding to create a new campground.
router.post('/', validateCampground, catchAsync(async (req,res) => {
    // if(!req.body.campground)	throw new ExpressError(400,'Invalid Campground Data');
    const newCamp = new Campground(req.body.campground)
    await newCamp.save();
    req.flash('success', 'Successfully made a new Campground!');
    res.redirect(`/campgrounds/${newCamp._id}`);
}));

router.get('/new', (req,res) => res.render('campgrounds/new') )

router.get('/:id/edit', catchAsync(async (req,res) => {
    const id = req.params.id;
    if(!mongoose.Types.ObjectId.isValid(id)){
        req.flash('error', `That's not a valid Campground!`);
        return res.redirect('/campgrounds');
    }
    const camp = await Campground.findById(id);
    if(!camp){
        req.flash('error', `That's not a valid Campground!`);
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit',{camp});
}));

router.get('/:id', catchAsync(async (req,res) => {
    const id = req.params.id;
    if(!mongoose.Types.ObjectId.isValid(id)){
        req.flash('error', `That's not a valid Campground!`);
        return res.redirect('/campgrounds');
    }
    const camp = await Campground.findById(id).populate('reviews');
    if(!camp){
        req.flash('error', `That's not a valid Campground!`);
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show',{camp});
}));

router.patch('/:id', validateCampground, catchAsync(async (req,res) => {
    const camp = req.body.campground;
    const campground = await Campground.findByIdAndUpdate(req.params.id,{...camp});
    req.flash('success', 'Successfully updated the Campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}));

router.delete('/:id', catchAsync(async (req,res) => {
	await Campground.findByIdAndDelete(req.params.id);
    req.flash('success', 'Successfully deleted the Campground!');
	res.redirect('/campgrounds');
}));

module.exports = router;
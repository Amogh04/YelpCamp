const { cloudinary } = require('../cloudinary');
const Campground = require('../models/campground');
const User = require('../models/user');
const mongoose = require('mongoose');
const maptilerClient = require("@maptiler/client");
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;

module.exports.index = async (req,res) => {
    let campgrounds = await Campground.find({});
    res.render('campgrounds/index',{campgrounds});
}

module.exports.createCampground = async (req,res) => {
    const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
    const newCamp = new Campground(req.body.campground);
    newCamp.geometry = geoData.features[0].geometry;
    newCamp.author = req.user._id;
    const user = await User.findById(req.user._id);
    user.campgrounds.push(newCamp._id);
    await user.save();
    newCamp.images = req.files.map(f => ({url: f.path, filename:f.filename}));
    await newCamp.save();
    req.flash('success', 'Successfully made a new Campground!');
    res.redirect(`/campgrounds/${newCamp._id}`);
}

module.exports.viewEditCampground = async (req,res) => {
    const camp = await Campground.findById(req.params.id);
    if(!camp){
        req.flash('error', `That's not a valid Campground!`);
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit',{camp});
}

module.exports.editCampground = async (req,res) => {
    const camp = await Campground.findByIdAndUpdate(req.params.id,{...req.body.campground});
    const images = req.files.map(f => ({url: f.path, filename:f.filename}));
    camp.images.push(...images);
    const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
    camp.geometry = geoData.features[0].geometry;
    await camp.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await camp.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated the Campground!');
    res.redirect(`/campgrounds/${camp._id}`);
}

module.exports.showCampground = async (req,res) => {
    const id = req.params.id;
    if(!mongoose.Types.ObjectId.isValid(id)){
        req.flash('error', `That's not a valid Campground!`);
        return res.redirect('/campgrounds');
    }
    let camp = await Campground.findById(id).populate('author').populate({
                        path:'reviews', 
                        populate:{
                            path:'author'
                        }
                    });
    if(!camp){
        req.flash('error', `That's not a valid Campground!`);
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show',{camp});
}

module.exports.deleteCampground = async (req,res) => {
    const {id} = req.params;
    const camp = await Campground.findById(id);
    await User.findByIdAndUpdate(camp.author._id, {$pull: {campgrounds: id}});
	await camp.deleteOne();
    req.flash('success', 'Successfully deleted the Campground!');
	res.redirect('/campgrounds');
}
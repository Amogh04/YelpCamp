const { cloudinary } = require('../cloudinary');
const Campground = require('../models/campground');
const mongoose = require('mongoose');

module.exports.index = async (req,res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index',{campgrounds});
}

module.exports.createCampground = async (req,res) => {
    const newCamp = new Campground(req.body.campground);
    newCamp.author = req.user._id;
    newCamp.images = req.files.map(f => ({url: f.path, filename:f.filename}));
    console.log(newCamp);
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
    await camp.save();
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
	await Campground.findByIdAndDelete(req.params.id);
    req.flash('success', 'Successfully deleted the Campground!');
	res.redirect('/campgrounds');
}

module.exports.deleteImage = async (req, res) => {
    const {id, imageId} = req.params;
    const {filename} = req.body;
    const camp = await Campground.findOneAndUpdate({_id:id}, {$pull: {images: {_id:imageId}}});
    await cloudinary.uploader.destroy(filename);
    res.redirect(`/campgrounds/${id}`);
}
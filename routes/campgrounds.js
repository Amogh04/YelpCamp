const express = require('express');
const catchAsync = require('../utilities/catchAsync');
const validateCampground = require('../utilities/validateCampground'); // validateCampground is a MIDDLEWARE FUNCTION that checks if the campground data is valid before proceeding to create a new campground.
const methodOverride = require('method-override');
const {checkLogin, isAuthor} = require('../utilities/middleware');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');
const multer = require('multer');
const {storage} = require('../cloudinary/index');
const upload = multer({storage});


router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(checkLogin, upload.array('image'), validateCampground,  catchAsync(campgrounds.createCampground))

router.get('/new', checkLogin, (req,res) => res.render('campgrounds/new'));
router.get('/:id/edit', checkLogin, isAuthor, catchAsync(campgrounds.viewEditCampground));

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .patch(checkLogin, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.editCampground))
    .delete(checkLogin, isAuthor, catchAsync(campgrounds.deleteCampground))


module.exports = router;
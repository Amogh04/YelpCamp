const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const {campgroundSchema} = require('./schemas')
const Campground = require('./models/campground');
const ExpressError = require('./utilities/ExpressError');
const catchAsync = require('./utilities/catchAsync');
	
	
mongoose.connect('mongodb://localhost:27017/yelpcamp');
	
	
mongoose.connection.on("error", console.error.bind(console, "connection error:"));
mongoose.connection.once("open", () => {
	console.log ("Database connected");
});

app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));
	
app.engine('ejs',ejsMate);

app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));


const validateCampground = (req,res,next) => {
	
	const {error} = campgroundSchema.validate(req.body);
	if(error){
		const msg = error.details.map(x => x.message).join(',');
		throw new ExpressError(400,msg);
	}
	else{
		next();
	}
}

	
app.get('/',(req,res) => {
	res.render('home');
});

app.get('/campgrounds', catchAsync(async (req,res) => {
	const campgrounds = await Campground.find({});
	res.render('campgrounds/index',{campgrounds});
}));
	
	
app.get('/campgrounds/new', (req,res) => {
	res.render('campgrounds/new');
})

app.post('/campgrounds', validateCampground, catchAsync(async (req,res) => {
	// if(!req.body.campground)	throw new ExpressError(400,'Invalid Campground Data');

	const newCamp = new Campground(req.body.campground)
	await newCamp.save();
	res.redirect(`/campgrounds/${newCamp._id}`);
}));

	
app.get('/campgrounds/:id', catchAsync(async (req,res) => {
	const id = req.params.id;
	const camp = await Campground.findById(id);
	res.render('campgrounds/show',{camp});
}));
	
app.get('/campgrounds/:id/edit', catchAsync(async (req,res) => {
	const id = req.params.id;
	const camp = await Campground.findById(id);
	res.render('campgrounds/edit',{camp});
}));
	
app.patch('/campgrounds/:id', validateCampground, catchAsync(async (req,res) => {
	const camp = req.body.campground;
	const campground = await Campground.findByIdAndUpdate(req.params.id,{...camp});
	res.redirect(`/campgrounds/${campground._id}`);
}));

app.delete('/campgrounds/:id', catchAsync(async (req,res) => {
	await Campground.findByIdAndDelete(req.params.id);
	res.redirect('/campgrounds');
}))

app.all('*',(req,res,next) => {
	next(new ExpressError(404,'Page not found!'));
})
	
app.use((err,req,res,next) => {
	const {statusCode = 500} = err;
	if(!err.message)	err.message = 'Something went wrong!';
	res.status(statusCode).render('error',{err});
})
	
app.listen(3000,()=>{
	console.log('Listening on Port 3000');
});
	
const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const Campground = require('./models/campground');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');

	
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

app.get('/',(req,res) => {
	res.render('home');
});

app.get('/campgrounds', async (req,res) => {
	const campgrounds = await Campground.find({});
	res.render('campgrounds/index',{campgrounds});
});
	

app.get('/campgrounds/new', (req,res) => {
	res.render('campgrounds/new');
})
app.post('/campgrounds', async (req,res) => {
	const camp = req.body.campground;
	const newCamp = new Campground(camp)
	await newCamp.save();
	res.redirect(`/campgrounds/${newCamp._id}`);
})
	
app.get('/campgrounds/:id', async (req,res) => {
	const id = req.params.id;
	const camp = await Campground.findById(id);
	res.render('campgrounds/show',{camp});
});

app.get('/campgrounds/:id/edit', async (req,res) => {
	const id = req.params.id;
	const camp = await Campground.findById(id);
	res.render('campgrounds/edit',{camp});
});

app.patch('/campgrounds/:id', async (req,res) => {
	const camp = req.body.campground;
	const campground = await Campground.findByIdAndUpdate(req.params.id,{...camp});
	res.redirect(`/campgrounds/${campground._id}`);
});

app.delete('/campgrounds/:id', async (req,res) => {
	await Campground.findByIdAndDelete(req.params.id);
	res.redirect('/campgrounds');
})
	
	
app.listen(3000,()=>{
	console.log('Listening on Port 3000');
});
	
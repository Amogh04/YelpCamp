if(process.env.NODE_ENV !== "production"){
	require('dotenv').config();
}
const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const ExpressError = require('./utilities/ExpressError');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/user')


mongoose.connect('mongodb://localhost:27017/yelpcamp');
mongoose.connection.on("error", console.error.bind(console, "connection error:"));
mongoose.connection.once("open", () => {
	console.log ("Database connected");
});

app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

const sessionConfig = {
	secret: 'thisshouldbeabettersecret',
	resave: false,
	saveUninitialized: true,
	cookie: {
		httpOnly: true,
		expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 1 week
		maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
	}
}
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()))    
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.engine('ejs',ejsMate);
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));



//Middleware for flash messages
app.use((req,res,next) => {
	res.locals.success = req.flash('success');
	res.locals.error = req.flash('error');
	res.locals.redirect = req.query.redirect;
	res.locals.currentUser = req.user;
	next();
});

app.use('/campgrounds', campgroundRoutes);	
app.use('/campgrounds/:id/reviews', reviewRoutes);	
app.use('/u', userRoutes);

app.get('/',(req,res) => {
	res.render('home');
});

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
	
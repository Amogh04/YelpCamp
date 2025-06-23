const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');


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

app.engine('ejs',ejsMate);
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));



app.use('/campgrounds', campgroundRoutes);	
app.use('/campgrounds/:id/reviews', reviewRoutes);	

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
	
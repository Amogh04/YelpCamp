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
const userRoutes = require('./routes/user');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const MongoStore = require('connect-mongo');
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelpcamp';
const secret = process.env.SECRET || 'thisshouldbeabettersecret!';
const port = process.env.PORT || 3000;

mongoose.connect(dbUrl);
mongoose.connection.on("error", console.error.bind(console, "connection error:"));
mongoose.connection.once("open", () => {
	console.log ("Database connected");
});

app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));


const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60, //seconds!
    crypto: {
        secret
    }
});

store.on("err", (err) => {
	console.log("Error:", err);
})

const sessionConfig = {
	store,
	name: 'sessId',
	secret,
	resave: false,
	saveUninitialized: true,
	cookie: {
		httpOnly: true,
		// secure: true,
		expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 1 week (milliseconds!)
		maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
	}
}
app.engine('ejs',ejsMate);
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));


app.use(session(sessionConfig));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(mongoSanitize({
	replaceWith:'_'
}));
app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/"
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/"
];
const connectSrcUrls = [
    "https://api.maptiler.com/",
];
const fontSrcUrls = [
	"https://fonts.googleapis.com",
	"https://fonts.gstatic.com"
];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            childSrc: ["blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
				"https://picsum.photos/",
				"https://fastly.picsum.photos/",
                "https://res.cloudinary.com/dddu1othk/", //SHOULD MATCH THE CLOUDINARY ACCOUNT ENVIRONMENT NAME! 
                "https://images.unsplash.com",
				"https://api.maptiler.com/"
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


// passport.use(new LocalStrategy(User.authenticate()));
passport.use(new LocalStrategy({ usernameField: 'login' }, async (login, password, done) => {
  try {

    const user = await User.findOne({
      $or: [{ username: login }, { email: login }]
    });
    if (!user) {
      return done(null, false, { message: 'User not found' });
    }
    // Use passport-local-mongoose's authenticate method
    user.authenticate(password, (err, authenticatedUser, error) => {
      if (err) return done(err);
      if (!authenticatedUser) return done(null, false, { message: error.message });
      return done(null, authenticatedUser);
    });
  } catch (err) {
    return done(err);
  }
}));


passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


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
	
app.listen(port,()=>{
	console.log('Listening on Port ', port);
});

module.exports = app;
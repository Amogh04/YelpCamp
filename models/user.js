const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;		//Shortcut to call it Schema instead of mongoose.Schema 

const userSchema = new Schema({
    name: {
      type: String,
      minlength: 3
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    campgrounds: [{
		type: Schema.Types.ObjectId,
		ref: 'Campground'
	}],
    reviews: [{
		type: Schema.Types.ObjectId,
		ref: 'Review'
	}]
});

userSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model('User',userSchema);
    
const mongoose = require('mongoose');
const Schema = mongoose.Schema;		//Shortcut to call it Schema instead of mongoose.Schema 
const User = require('./user');

const reviewSchema = new Schema({
    body: String,
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
	dateCreated: {
		type: Date,
		default: Date.now
	},
    author:{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

module.exports = mongoose.model('Review',reviewSchema);
    
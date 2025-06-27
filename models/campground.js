const mongoose = require('mongoose');
const review = require('./review');
const User = require('./user');
const Schema = mongoose.Schema;		//Shortcut to call it Schema instead of mongoose.Schema 

const CampgroundSchema = new Schema({
	title: String,
	images: [
		{
			url: String,
			filename: String
		}
	],
	price: Number,
	description: String,
	location: String,
	reviews: [{
		type: Schema.Types.ObjectId,
		ref: 'Review'
	}],
	author: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    }
}, {toJSON: {virtuals:true} } );
// Because Mongoose does not include virtuals when converting to JSON (needed for cluster Map)

CampgroundSchema.post('findOneAndDelete', async function(doc) {
	if(doc) {
		await review.deleteMany({
			_id: {
				$in: doc.reviews
			}
		});
	} else {
		console.log('No document found to delete reviews for.');
	}
});

// For Maptiler Cluster Map Popup
CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
	return `<b><a href="/campgrounds/${this._id}">${this.title}</a></b>, <br>${this.location}`
})

module.exports = mongoose.model('Campground',CampgroundSchema);
	 
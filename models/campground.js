const mongoose = require('mongoose');
const review = require('./review');
const Schema = mongoose.Schema;		//Shortcut to call it Schema instead of mongoose.Schema 

const CampgroundSchema = new Schema({
	title:String,
	image:String,
	price:Number,
	description:String,
	location:String,
	reviews:[{
		type: Schema.Types.ObjectId,
		ref: 'Review'
	}]
});

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

module.exports = mongoose.model('Campground',CampgroundSchema);
	 
const Joi = require('joi');
module.exports.campgroundSchema = Joi.object({			//JOI schema to Validate from server side
	campground: Joi.object({
		title: Joi.string().required(),
		price: Joi.number().required().min(0),
		location: Joi.string().required(),
		description: Joi.string().required(),
		image: Joi.string().required(),
	}).required()
});

	
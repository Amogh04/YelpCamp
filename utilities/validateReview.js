const Joi = require('joi');
const ExpressError = require('./ExpressError');

reviewSchema = Joi.object({			//JOI schema to Validate campgrounds from server side
	review: Joi.object({
		rating: Joi.number().required().min(1).max(5),
		body: Joi.string().required()
	}).required()
});

module.exports = (req,res,next) => {
	const {error} = reviewSchema.validate(req.body);
	if(error){
		const msg = error.details.map(x => x.message).join(',');
		throw new ExpressError(400,msg);
	}
	else	next();
}
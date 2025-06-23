const Joi = require('joi');
const ExpressError = require('./ExpressError');

const campgroundSchema = Joi.object({			//JOI schema to Validate campgrounds from server side
	campground: Joi.object({
		title: Joi.string().required(),
		price: Joi.number().required().min(0),
		location: Joi.string().required(),
		description: Joi.string().required(),
		image: Joi.string().required()
	}).required()
});

module.exports  = (req,res,next) => {
    const {error} = campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(x => x.message).join(',');
        throw new ExpressError(400,msg);
    }
    else	next();
};

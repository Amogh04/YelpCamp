const BaseJoi = require('joi');
const ExpressError = require('./ExpressError');
const sanitizeHtml = require('sanitize-html');

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension)
const campgroundSchema = Joi.object({			//JOI schema to Validate campgrounds from server side
	campground: Joi.object({
		title: Joi.string().required().escapeHTML(),
		price: Joi.number().required().min(0),
		location: Joi.string().required().escapeHTML(),
		description: Joi.string().required().escapeHTML()
	}).required()
});

module.exports  = (req,res,next) => {
    console.log('req.body.campground = ',req.body);
    const {error} = campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(x => x.message).join(',');
        throw new ExpressError(400,msg);
    }
    else	next();
};

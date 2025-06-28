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

const reviewSchema = Joi.object({			//JOI schema to Validate campgrounds from server side
	review: Joi.object({
		rating: Joi.number().required().min(1).max(5),
		body: Joi.string().required().escapeHTML()
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
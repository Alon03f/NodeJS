const Joi = require("joi");

const userSchema = Joi.object({
    name: Joi.object({
        first: Joi.string().min(2).max(255).required(),
        middle: Joi.string().max(255).allow(""),
        last: Joi.string().min(2).max(255).required()
    }).required(),
    phone: Joi.string().min(9).max(15).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(255).required(),
    image: Joi.object({
        url: Joi.string().uri().allow(""),
        alt: Joi.string().allow("")
    }),
    address: Joi.object({
        state: Joi.string().max(255).allow(""),
        country: Joi.string().min(2).max(255).required(),
        city: Joi.string().min(2).max(255).required(),
        street: Joi.string().min(2).max(255).required(),
        houseNumber: Joi.number().min(1).required(),
        zip: Joi.number().min(0).allow(0)
    }).required(),
    isBusiness: Joi.boolean(),
    isAdmin: Joi.boolean()
});

const validateUser = (userData) => userSchema.validate(userData);

module.exports = { validateUser };
const Joi = require("joi");

const cardSchema = Joi.object({
    title: Joi.string().min(2).max(255).required(),
    subtitle: Joi.string().min(2).max(255).required(),
    description: Joi.string().min(10).max(1024).required(),
    phone: Joi.string().min(9).max(15).required(),
    email: Joi.string().email().required(),
    web: Joi.string().allow("").optional(),
    image: Joi.alternatives().try(
        Joi.string().allow("").optional(),
        Joi.object({
            url: Joi.string().allow("").optional(),
            alt: Joi.string().allow("").optional()
        }).optional()
    ).optional(),
    address: Joi.object({
        state: Joi.string().allow("").optional(),
        country: Joi.string().min(2).max(255).required(),
        city: Joi.string().min(2).max(255).required(),
        street: Joi.string().min(2).max(255).required(),
        houseNumber: Joi.number().min(1).required(),
        zip: Joi.number().min(0).optional()
    }).required()
});

const validateCard = (cardData) => {
    return cardSchema.validate(cardData, {
        allowUnknown: false,
        stripUnknown: true
    });
};

module.exports = { validateCard };
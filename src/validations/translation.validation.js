const Joi = require('joi');
const config = require('../config/config');

const translationRequest = {
  body: Joi.object().keys({
    text: Joi.string().required().min(2),
    cache: Joi.boolean(),
    source_lang: Joi.string().uppercase().length(2),
    target_lang: Joi.string()
      .uppercase()
      .length(2)
      .required()
      .valid(...config.translation.languages),
  }),
};

module.exports = {
  translationRequest,
};

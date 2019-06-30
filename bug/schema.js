
const Joi = require('@hapi/joi');

module.exports.initSchema = Joi.object().keys({
  board_name: Joi.string().required()
});

module.exports.createSchema = Joi.object().keys({
  name: Joi.string().required(),
  context: Joi.string().required(),
  summary: Joi.string().required(),
  steps_to_produce: Joi.string().required(),
  expected_result: Joi.string().required(),
  actual_result: Joi.string().required(),
  notes: Joi.string(),
  label: Joi.any().valid('critical', 'major', 'minor', 'trivial').required(),
});


const joi = require("joi");

// Define and normalize expected fields
const userSchema = joi.object({
  email: joi.string().trim().email().required(),
  password: joi.string().min(6).max(30).required(),
});

const userEmailSchema = joi.object({
  email: joi.string().trim().email().required()
});

module.exports = { userSchema, userEmailSchema };

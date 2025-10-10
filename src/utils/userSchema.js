const joi = require("joi");

// Define and normalize expected fields
const userSchema = joi.object({
  email: joi.string().trim().email().required(),
  password: joi.string().min(6).max(30).required(),
});

const userEmailSchema = joi.object({
  email: joi.string().trim().email().required()
});

const userChangePasswordSchema = joi.object({
  newPassword: joi.string().trim().min(6).max(30).required(),
  newPasswordConfirm: joi.string().trim().min(6).max(30).required().valid(joi.ref('newPassword')).messages({
      'any.only': 'Passwords do not match',
  }),
});

module.exports = { userSchema, userEmailSchema, userChangePasswordSchema };

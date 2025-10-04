const { userSchema } = require("../utils/userSchema");

const validateUser = (req, res, next) =>{
    
    const { error, value } = userSchema.validate(req.body);

    if (error) {
        return next({ statusCode: 400, message: error.details[0].message });
    }

    // Use sanitized/normalized value downstream
    req.body = value;
    return next();
}

module.exports = { validateUser }

const { checkJWTToken, checkEmailActivateToken } = require("../utils/jwtToken");
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

const validateActivateAccount = (req, res, next) =>{
    const {token, uid} = req.query;
    if(!token || !uid) return next({ statusCode: 400, message: "Missing token or uid in query parameters" });
    try {
        const payload = checkEmailActivateToken(token);
        if(!payload.valid || payload.decoded.id !== parseInt(uid)) return next({ statusCode: 400, message: "Invalid token or uid" });
        req.emailVerify = {uid};
        next();
    } catch (error) {
        return next(error);
    }
}

const checkUserRole = (req, res, next) =>{
    if(!req.user) return res.sendStatus(401);
    if(req.user.role === "user" || req.user.role === "admin") return next();
    return next(new Error("Forbidden"));
};

const verifyJWTToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];    
    const user = authHeader && authHeader.split(' ')[1];
    if(!user) return res.sendStatus(401);
    const {valid} = checkJWTToken(user);
    return valid ? next() : res.sendStatus(403);
}

module.exports = { validateUser, checkUserRole, validateActivateAccount, verifyJWTToken }

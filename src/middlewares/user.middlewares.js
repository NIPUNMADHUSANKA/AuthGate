const { checkAccountActivate, getUserById, getUserByEmail } = require("../services/user.services");
const { checkJWTToken, checkEmailActivateToken } = require("../utils/jwtToken");
const { userSchema, userEmailSchema, userChangePasswordSchema } = require("../utils/userSchema");

const authGateInfo = (req, res) =>{
    res.status(200).json({
        service: 'AuthGate',
        status: 'running',
        version: '1.0.0'
    })
}

const notFoundHandler = (req, res) =>{
    res.status(404).json({
        success: false,
        message: 'Route not found'
    })
}

const validateUser = (req, res, next) =>{
    
    const { error, value } = userSchema.validate(req.body);

    if (error) {
        return next({ statusCode: 400, message: error.details[0].message });
    }

    // Use sanitized/normalized value downstream
    req.body = value;
    return next();
}

const validateActivateAccount = async(req, res, next) =>{
    const {token, uid} = req.query;
    if(!token || !uid) return next({ statusCode: 400, message: "Missing token or uid in query parameters" });
    try {
        const payload = checkEmailActivateToken(token);
        if(!payload.valid || parseInt(payload.decoded.id) !== parseInt(uid)) return next({ statusCode: 400, message: "Invalid token or uid" });
        const {email_verified} = await checkAccountActivate(uid);
        if(email_verified) return res.status(200).json({ message: "Account already activated" });
        req.emailVerify = {uid};
        next();
    } catch (error) {
        return next(error);
    }
}

const checkUserRole = (req, res, next) =>{
    if(!req.user) return res.sendStatus(401);
    if(req.user.role === "user" || req.user.role === "admin") return next();
    return next({ statusCode: 403, message: "Forbidden" });
};

const verifyJWTToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if(!token) return res.sendStatus(401);
    const { valid, decoded } = checkJWTToken(token);
    if(!valid || !decoded) return res.sendStatus(403);
    if (!req.user) return res.sendStatus(403); 
    return next();
}


const validateResendVerificationEmail = async(req, res, next) =>{
    const { id } = req.params;
    if(!id) return next({ statusCode: 400, message: "Missing id in params"});
    try {
        const user = await getUserById(id);
        if(!user) return next({ statusCode: 404, message: "User not found"});
        const {email_verified} = await checkAccountActivate(id);
        if(email_verified) return res.status(200).json({ message: "Account already activated" });
        req.resend_token =  { id: user.id, email: user.email };
        next();     
    } catch (error) {
        next(error);
    }
}

const validforgetPasswordEmail = async(req, res, next) =>{
    const {error, value}  = userEmailSchema.validate(req.body);
    if (error) {
        return next({ statusCode: 400, message: error.details[0].message });
    }
    req.body = value;
    try {
        const user = await getUserByEmail(value.email);
        if(!user) return next({ statusCode: 404, message: "User not found"});
        req.resend_token =  { id: user.id, email: value.email };
    } catch (error) {
        next(error);
    }
    return next();
}

const validateChangePasswordUrl = async(req, res, next) =>{
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

const validateChangePasswordDetails = (req, res, next) =>{
    const {error, value} = userChangePasswordSchema.validate(req.body);
     if (error) {
        return next({ statusCode: 400, message: error.details[0].message });
    }
    req.body = value;
    next();
} 

module.exports = { authGateInfo, notFoundHandler, validateUser, checkUserRole, validateActivateAccount, verifyJWTToken, validateResendVerificationEmail, validforgetPasswordEmail, validateChangePasswordUrl, validateChangePasswordDetails }

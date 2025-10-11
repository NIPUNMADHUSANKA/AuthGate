const passport = require("passport");
const { userRegister, loginUser, refreshUserToken, userLogout, userActivate, resendVerificationEmail, deleteUserAccount, sendChangePasswordEmail, ChangePassword } = require("../controllers/user.controllers");
const { validateUser, checkUserRole, verifyJWTToken, validateActivateAccount, validateResendVerificationEmail, validforgetPasswordEmail, validateChangePasswordDetails, validateChangePasswordUrl } = require("../middlewares/user.middlewares");
const { authLimiter } = require("../utils/rateLimiting");

const userrouter = require("express").Router();

userrouter.post('/api/auth/register', authLimiter, validateUser, userRegister);
userrouter.post('/api/auth/login', authLimiter, validateUser, passport.authenticate("local"), loginUser);

// Google OAuth: initiate
userrouter.get('/api/auth/login/google', authLimiter, passport.authenticate('google', { scope: ['email', 'profile'], state: true }));

// Google OAuth: callback
userrouter.get('/api/auth/login/google/callback', authLimiter, passport.authenticate('google', { failureRedirect: '/login?error=oauth' }),loginUser);

userrouter.get('/api/auth/status', verifyJWTToken, checkUserRole, (req,res)=>{
    return req.user ? res.send(req.user) : res.sendStatus(401);
})

userrouter.post('/api/auth/refreshToken', authLimiter, refreshUserToken);

userrouter.get('/api/auth/logout', checkUserRole, userLogout);

userrouter.get('/api/auth/verify', authLimiter, validateActivateAccount, userActivate )

userrouter.post('/api/auth/resend-verification/:id', authLimiter, validateResendVerificationEmail, resendVerificationEmail);

userrouter.delete('/api/auth/deleteAccount/:id', verifyJWTToken, checkUserRole, deleteUserAccount)

userrouter.post('/api/auth/forgot-password', authLimiter, validforgetPasswordEmail, sendChangePasswordEmail)

userrouter.post('/api/auth/change-password', authLimiter, validateChangePasswordUrl, validateChangePasswordDetails, ChangePassword);

module.exports = userrouter; 

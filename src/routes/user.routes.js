const passport = require("passport");
const { userRegister, loginUser, refreshUserToken, userLogout, userActivate, resendVerificationEmail, deleteUserAccount, sendChangePasswordEmail, ChangePassword } = require("../controllers/user.controllers");
const { validateUser, checkUserRole, verifyJWTToken, validateActivateAccount, validateResendVerificationEmail, validforgetPasswordEmail, validateChangePasswordDetails, validateChangePasswordUrl } = require("../middlewares/user.middlewares");

const userrouter = require("express").Router();

userrouter.post('/api/auth/register', validateUser, userRegister);
userrouter.post('/api/auth/login', validateUser, passport.authenticate("local"), loginUser);

userrouter.get('/api/auth/status', verifyJWTToken, checkUserRole, (req,res)=>{
    return req.user ? res.send(req.user) : res.sendStatus(401);
})

userrouter.post('/api/auth/refreshToken', checkUserRole, refreshUserToken);

userrouter.get('/api/auth/logout', checkUserRole, userLogout);

userrouter.get('/api/auth/verify', validateActivateAccount, userActivate )

userrouter.post('/api/auth/resend-verification/:id', validateResendVerificationEmail, resendVerificationEmail);

userrouter.delete('/api/auth/deleteAccount/:id', verifyJWTToken, checkUserRole, deleteUserAccount)

userrouter.post('/api/auth/forgot-password', validforgetPasswordEmail, sendChangePasswordEmail)

userrouter.post('/api/auth/change-password', validateChangePasswordUrl, validateChangePasswordDetails, ChangePassword);

module.exports = userrouter; 
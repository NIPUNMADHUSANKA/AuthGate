const passport = require("passport");
const { userRegister, loginUser, refreshUserToken, userLogout, userActivate } = require("../controllers/user.controllers");
const { validateUser, checkUserRole, verifyJWTToken, checkAdminRole, validateActivateAccount } = require("../middlewares/user.middlewares");

const userrouter = require("express").Router();

userrouter.post('/api/auth/register', validateUser, userRegister);
userrouter.post('/api/auth/login', validateUser, passport.authenticate("local"), loginUser);

userrouter.get('/api/auth/status', verifyJWTToken, checkUserRole, (req,res)=>{
    return req.user ? res.send(req.user) : res.sendStatus(401);
})

userrouter.post('/api/auth/refreshToken', checkUserRole, refreshUserToken);

userrouter.get('/api/auth/logout', checkUserRole, userLogout);

userrouter.patch('/api/auth/verify', validateActivateAccount, userActivate )

module.exports = userrouter; 
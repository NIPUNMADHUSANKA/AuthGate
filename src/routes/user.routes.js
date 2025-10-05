const passport = require("passport");
const { userRegister, loginUser } = require("../controllers/user.controllers");
const { validateUser, checkUserRole } = require("../middlewares/user.middlewares");

const userrouter = require("express").Router();

userrouter.post('/api/auth/register', validateUser, userRegister);
userrouter.post('/api/auth/login', validateUser, passport.authenticate("local"), loginUser);

userrouter.get('/api/auth/status', checkUserRole, (req,res)=>{
    return req.user ? res.send(req.user) : res.sendStatus(401);
})


module.exports = userrouter; 
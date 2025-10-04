const { userRegister } = require("../controllers/user.controllers");
const { validateUser } = require("../middlewares/user.middlewares");

const userrouter = require("express").Router();

userrouter.post('/api/auth/register', validateUser, userRegister);


module.exports = userrouter; 
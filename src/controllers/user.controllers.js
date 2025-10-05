const ms = require('ms');
const { saveUser, saveToken, getRefreshToken } = require('../services/user.services');
const { hashPassword, hashToken, compareToken } = require('../utils/hash');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwtToken');

const userRegister = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const hashed = await hashPassword(password);
    const user = await saveUser({ email, password: hashed });
    return res.status(201).json({ userId: user.id, email: user.email, message: "User registered" });
  } catch (error) {
    return next(error);
  }
}; 

const loginUser = async(req, res) =>{
  const {accessToken, refreshToken} = generateToken(req.user);
  try {
    const hashedToken = await hashToken(refreshToken);
    await saveToken(req.user.id, hashedToken, Math.floor(ms(process.env.JWT_REFRESH_EXPIRES_IN || "7d") / 1000));
    return res.status(201).json({ accessToken, refreshToken });
  } catch (error) {
    throw error;
  }
}


const generateToken = (user) =>{
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user); 

  return {accessToken, refreshToken};
}

const refreshUserToken = async(req, res) =>{
  const { refreshToken } = req.body;
  if(!refreshToken) return res.senStatus(401);
  try {
     const {id, token_hash} = await getRefreshToken(req.user.id);
     if(!id) return res.sendStatus(403);
     const validateToken = await compareToken(refreshToken, token_hash);
     if(!validateToken) return res.sendStatus(403);
     const accessToken = generateAccessToken(req.user);
     return res.status(201).json({accessToken});
  } catch (error) {
      throw error;
  }
}

module.exports = { userRegister, loginUser, generateToken, refreshUserToken };

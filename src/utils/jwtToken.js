require('dotenv').config();
const jwt = require('jsonwebtoken');

const generateAccessToken = (user) =>{
  return jwt.sign(user, process.env.JWT_ACCESS_SECRET, {expiresIn: process.env.JWT_ACCESS_EXPIRES_IN});
}
const generateRefreshToken = (user) =>{
    return jwt.sign(user, process.env.JWT_REFRESH_SECRET, {expiresIn: process.env.JWT_REFRESH_EXPIRES_IN});
}

module.exports = { generateAccessToken, generateRefreshToken }
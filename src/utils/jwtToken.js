require('dotenv').config();
const jwt = require('jsonwebtoken');

const generateAccessToken = (user) =>{
  return jwt.sign(user, process.env.JWT_ACCESS_SECRET, {expiresIn: process.env.JWT_ACCESS_EXPIRES_IN});
}
const generateRefreshToken = (user) =>{
    return jwt.sign(user, process.env.JWT_REFRESH_SECRET, {expiresIn: process.env.JWT_REFRESH_EXPIRES_IN});
}

const checkJWTToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    return { valid: true, decoded };
  } catch (err) {
    return { valid: false, error: err.message };
  }
};

module.exports = { generateAccessToken, generateRefreshToken, checkJWTToken }
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

const hash = async(data) =>{
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(data, salt);
}

const compare =async(data, hashData) =>{
  return bcrypt.compare(data, hashData);
}

const hashPassword = async(password) => {
  return hash(password);
}

const comparePassword = async(password, hashedPassword) => {
  return compare(password, hashedPassword);
}

const hashToken = async(token) => {
  return hash(token);
}

const compareToken = async(token, hashedToken) => {
  return compare(token, hashedToken);
}

module.exports = { hashPassword, comparePassword, hashToken, compareToken };


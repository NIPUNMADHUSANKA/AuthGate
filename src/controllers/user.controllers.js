const { saveUser } = require('../services/user.services');
const { hashPassword } = require('../utils/hash');

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

module.exports = { userRegister };

const ms = require('ms');
const { saveUser, saveToken, getRefreshToken, deleteRefreshToken, userAccountActivate, deleteUserAccountService, getUserByEmail, userPasswordUpdate } = require('../services/user.services');
const { hashPassword, hashToken, compareToken } = require('../utils/hash');
const { generateAccessToken, generateRefreshToken, generateEmailActivateToken } = require('../utils/jwtToken');
const { sendVerifyEmail, sendForgotPasswordEmail } = require('../utils/sendmail');

const userRegister = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const hashed = await hashPassword(password);
    const user = await saveUser({ email, password: hashed });
    const token = generateEmailActivateToken(user);
    await sendVerifyEmail(user.email, user.id, token);
    return res.status(201).json({ userId: user.id, email: user.email, message: "User registered successfully. Please check your email to verify your account." });
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

const userLogout = async(req, res) => {
  try {
    const deleteToken = await deleteRefreshToken(req.user.id);
    if(!deleteToken) return res.status(400).json({message: "Logout Failed"});
    req.logout((err) => {
      return err ? res.status(500).json({message: "Logout Failed"}) : res.status(200).json({message: "Logged out successfully"});
    });
  } catch (error) {
    throw error;
  }
}

const userActivate = async(req, res) =>{
  try {
    const { uid } = req.emailVerify;
    const active = await userAccountActivate(uid, true);
    return active ? res.status(200).json({message: "Email verified! You can now log in."}) : res.sendStatus(404);
  } catch (error) {
    throw error;
  }
}

const resendVerificationEmail = async(req, res) =>{
  try {
    const token = generateEmailActivateToken(req.resend_token);
    await sendVerifyEmail(req.resend_token.email, req.resend_token.id, token);
    return res.status(201).json({ message: "Verification email resent successfully. Please check your inbox." });
  } catch (error) {
    throw error;
  }
}

const deleteUserAccount = async(req, res)=>{
  const { id } = req.params;
  if(!id) return res.status(400).json({message: 'Missing id in params'});
  try {
    const deleteUser = await deleteUserAccountService(id);
    return deleteUser
    ? res.status(200).json({ message: "Your account has been successfully deleted." })
    : res.status(404).json({ message: "User account could not be found." });
  } catch (error) {
    throw error; 
  }
}

const sendChangePasswordEmail = async(req, res) =>{
  try {
    const token = generateEmailActivateToken(req.resend_token);
    await sendForgotPasswordEmail(req.resend_token.email, req.resend_token.id, token);
    return res.status(201).json({ message: "Password reset email has been sent successfully. Please check your inbox." });
  } catch (error) {
    throw error;
  }
}

const ChangePassword = async(req, res)=>{
  try {
    const {uid} = req.emailVerify;
    const {newPassword} = req.body;
    const hashed = await hashPassword(newPassword);
    const changedPassword = await userPasswordUpdate(uid, hashed);
    if (changedPassword) {
      return res.status(200).json({
        message: "Password updated successfully.",
      });
    } else {
      return res.status(400).json({
        message: "Password update failed. Please try again.",
      });
}
  } catch (error) {
    throw error;
  }
}

module.exports = { userRegister, loginUser, generateToken, refreshUserToken, userLogout, userActivate, resendVerificationEmail, deleteUserAccount, sendChangePasswordEmail, ChangePassword };

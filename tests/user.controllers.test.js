// Jest unit tests for src/controllers/user.controllers.js

jest.mock('../src/services/user.services', () => ({
  saveUser: jest.fn(),
  saveToken: jest.fn(),
  getRefreshToken: jest.fn(),
  deleteRefreshToken: jest.fn(),
  userAccountActivate: jest.fn(),
  deleteUserAccountService: jest.fn(),
  getUserByEmail: jest.fn(),
  userPasswordUpdate: jest.fn(),
}));

jest.mock('../src/utils/hash', () => ({
  hashPassword: jest.fn(),
  hashToken: jest.fn(),
  compareToken: jest.fn(),
}));

jest.mock('../src/utils/jwtToken', () => ({
  generateAccessToken: jest.fn(),
  generateRefreshToken: jest.fn(),
  generateEmailActivateToken: jest.fn(),
  checkRefreshToken: jest.fn(),
}));

jest.mock('../src/utils/sendmail', () => ({
  sendVerifyEmail: jest.fn(),
  sendForgotPasswordEmail: jest.fn(),
}));

const services = require('../src/services/user.services');
const hash = require('../src/utils/hash');
const jwtToken = require('../src/utils/jwtToken');
const mail = require('../src/utils/sendmail');
const controllers = require('../src/controllers/user.controllers');

function createReqRes(initial = {}) {
  const req = { headers: {}, params: {}, query: {}, body: {}, ...initial };
  const res = {
    _status: null,
    _json: undefined,
    sendStatus(code) {
      this._status = code;
      return this;
    },
    status(code) {
      this._status = code;
      return this;
    },
    json(payload) {
      this._json = payload;
      return this;
    },
  };
  return { req, res };
}

describe('user.controllers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_REFRESH_EXPIRES_IN = '7d';
  });

  it('should register a user successfully and send verification email', async () => {
    const { req, res } = createReqRes({ body: { email: 'user@example.com', password: 'Passw0rd' } });
    const next = jest.fn();
    hash.hashPassword.mockResolvedValueOnce('hashed');
    services.saveUser.mockResolvedValueOnce({ id: 1, email: 'user@example.com' });
    jwtToken.generateEmailActivateToken.mockReturnValueOnce('email-token');
    mail.sendVerifyEmail.mockResolvedValueOnce();

    await controllers.userRegister(req, res, next);

    expect(res._status).toBe(201);
    expect(res._json).toEqual({ userId: 1, email: 'user@example.com', message: expect.any(String) });
    expect(mail.sendVerifyEmail).toHaveBeenCalledWith('user@example.com', 1, 'email-token');
    expect(next).not.toHaveBeenCalled();
  });

  it('should log in a user successfully and save refresh token', async () => {
    const { req, res } = createReqRes({ user: { id: 5 } });
    jwtToken.generateAccessToken.mockReturnValueOnce('access');
    jwtToken.generateRefreshToken.mockReturnValueOnce('refresh');
    hash.hashToken.mockResolvedValueOnce('hashed-refresh');
    services.saveToken.mockResolvedValueOnce({ id: 1, user_id: 5 });

    await controllers.loginUser(req, res);

    expect(res._status).toBe(201);
    expect(res._json).toEqual({ accessToken: 'access', refreshToken: 'refresh' });
    const ms = require('ms');
    const expectedExp = Math.floor(ms('7d') / 1000);
    expect(services.saveToken).toHaveBeenCalledWith(5, 'hashed-refresh', expectedExp);
  });

  it('should return 401 when refresh token is missing in request body', async () => {
    const { req, res } = createReqRes({ body: {} });
    await controllers.refreshUserToken(req, res);
    expect(res._status).toBe(401);
  });

  it('should return 403 when refresh token is invalid', async () => {
    const { req, res } = createReqRes({ body: { refreshToken: 'bad' } });
    jwtToken.checkRefreshToken.mockReturnValueOnce({ valid: false });
    await controllers.refreshUserToken(req, res);
    expect(res._status).toBe(403);
  });

  it('should refresh access token successfully when refresh token is valid', async () => {
    const { req, res } = createReqRes({ body: { refreshToken: 'valid' }, user: { id: 7 } });
    jwtToken.checkRefreshToken.mockReturnValueOnce({ valid: true, decoded: { id: 7 } });
    services.getRefreshToken.mockResolvedValueOnce({ id: 1, token_hash: 'stored' });
    hash.compareToken.mockResolvedValueOnce(true);
    jwtToken.generateAccessToken.mockReturnValueOnce('new-access');
    await controllers.refreshUserToken(req, res);
    expect(res._status).toBe(200);
    expect(res._json).toEqual({ accessToken: 'new-access' });
  });

  it('should log out a user successfully and delete refresh token', async () => {
    const logoutMock = jest.fn(cb => cb());
    const { req, res } = createReqRes({ user: { id: 7 }, logout: logoutMock });
    services.deleteRefreshToken.mockResolvedValueOnce(true);
    await controllers.userLogout(req, res);
    expect(res._status).toBe(200);
    expect(res._json).toEqual({ message: 'Logged out successfully' });
  });

  it('should return 400 when logout fails due to missing refresh token deletion', async () => {
    const { req, res } = createReqRes({ user: { id: 7 }, logout: jest.fn() });
    services.deleteRefreshToken.mockResolvedValueOnce(false);
    await controllers.userLogout(req, res);
    expect(res._status).toBe(400);
    expect(res._json).toEqual({ message: 'Logout Failed' });
  });

  it('should activate a user account successfully', async () => {
    const { req, res } = createReqRes({ emailVerify: { uid: 3 } });
    services.userAccountActivate.mockResolvedValueOnce(true);
    await controllers.userActivate(req, res);
    expect(res._status).toBe(200);
    expect(res._json).toEqual({ message: 'Email verified! You can now log in.' });
  });

  it('should resend verification email successfully', async () => {
    const { req, res } = createReqRes({ resend_token: { id: 2, email: 'user@example.com' } });
    jwtToken.generateEmailActivateToken.mockReturnValueOnce('tok');
    mail.sendVerifyEmail.mockResolvedValueOnce();
    await controllers.resendVerificationEmail(req, res);
    expect(res._status).toBe(201);
    expect(mail.sendVerifyEmail).toHaveBeenCalledWith('user@example.com', 2, 'tok');
  });

  it('should send change password email successfully', async () => {
    const { req, res } = createReqRes({ resend_token: { id: 2, email: 'user@example.com' } });
    jwtToken.generateEmailActivateToken.mockReturnValueOnce('tok');
    mail.sendForgotPasswordEmail.mockResolvedValueOnce();
    await controllers.sendChangePasswordEmail(req, res);
    expect(res._status).toBe(201);
    expect(mail.sendForgotPasswordEmail).toHaveBeenCalledWith('user@example.com', 2, 'tok');
  });

  it('should delete user account successfully when requested by the owner', async () => {
    const { req, res } = createReqRes({ params: { id: '5' }, user: { id: 5 } });
    services.deleteUserAccountService.mockResolvedValueOnce(true);
    await controllers.deleteUserAccount(req, res);
    expect(res._status).toBe(200);
    expect(res._json).toEqual({ message: 'Your account has been successfully deleted.' });
  });

  it('should return 403 when user tries to delete an account they do not own', async () => {
    const { req, res } = createReqRes({ params: { id: '5' }, user: { id: 6 } });
    await controllers.deleteUserAccount(req, res);
    expect(res._status).toBe(403);
  });

  it('should update user password successfully when change password request is valid', async () => {
    const { req, res } = createReqRes({ emailVerify: { uid: 9 }, body: { newPassword: 'X' } });
    hash.hashPassword.mockResolvedValueOnce('hash');
    services.userPasswordUpdate.mockResolvedValueOnce(true);
    await controllers.ChangePassword(req, res);
    expect(res._status).toBe(200);
    expect(res._json).toEqual({ message: 'Password updated successfully.' });
  });
});


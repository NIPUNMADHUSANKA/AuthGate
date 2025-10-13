// Mock modules that would cause side effects (DB, JWT verification)
jest.mock('../src/services/user.services', () => ({
  checkAccountActivate: jest.fn(),
  getUserById: jest.fn(),
  getUserByEmail: jest.fn(),
}));

jest.mock('../src/utils/jwtToken', () => ({
  checkJWTToken: jest.fn(),
  checkEmailActivateToken: jest.fn(),
}));

const jwtToken = require('../src/utils/jwtToken');
const middlewares = require('../src/middlewares/user.middlewares');

const {
  validateUser,
  checkUserRole,
  verifyJWTToken,
  validateChangePasswordDetails,
} = middlewares;

function createReqRes(initial = {}) {
  const req = { headers: {}, ...initial };
  const res = {
    _status: null,
    _json: undefined,
    _send: undefined,
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
    send(payload) {
      this._send = payload;
      return this;
    },
  };
  return { req, res };
}

describe('checkUserRole', () => {
  it('should respond with 401 if no user is present on the request', () => {
    const { req, res } = createReqRes({ user: undefined });
    const next = jest.fn();
    checkUserRole(req, res, next);
    expect(res._status).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next when the user has role "user"', () => {
    const { req, res } = createReqRes({ user: { role: 'user' } });
    const next = jest.fn();
    checkUserRole(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res._status).toBeNull();
  });

  it('should call next with a 403 error when the user role is invalid', () => {
    const { req, res } = createReqRes({ user: { role: 'guest' } });
    const next = jest.fn();
    checkUserRole(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
  });
});

describe('validateUser', () => {
  it('should call next with sanitized body when the request body is valid', () => {
    const { req, res } = createReqRes({ body: { email: 'user@example.com', password: 'StrongP@ss1' } });
    const next = jest.fn();
    validateUser(req, res, next);
    expect(next).toHaveBeenCalledWith();
    expect(req.body.email).toBe('user@example.com');
    expect(Object.keys(req.body).sort()).toEqual(['email', 'password']);
  });

  it('should call next with a 400 error when the request body is invalid', () => {
    const { req, res } = createReqRes({ body: { email: 'bad', password: 'short' } });
    const next = jest.fn();
    validateUser(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400, message: expect.any(String) }));
  });
});

describe('validateChangePasswordDetails', () => {
  it('should call next when newPassword and newPasswordConfirm match', () => {
    const { req, res } = createReqRes({ body: { newPassword: 'NewStr0ng1', newPasswordConfirm: 'NewStr0ng1' } });
    const next = jest.fn();
    validateChangePasswordDetails(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('should call next with a 400 error when newPassword and newPasswordConfirm do not match', () => {
    const { req, res } = createReqRes({ body: { newPassword: 'NewStr0ng1', newPasswordConfirm: 'Mismatch1' } });
    const next = jest.fn();
    validateChangePasswordDetails(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400, message: 'Passwords do not match' }));
  });
});

describe('verifyJWTToken', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should respond with 401 when the Authorization header is missing', () => {
    const { req, res } = createReqRes({ headers: {} });
    const next = jest.fn();
    verifyJWTToken(req, res, next);
    expect(res._status).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should respond with 401 when the token part is missing from the Authorization header', () => {
    const { req, res } = createReqRes({ headers: { authorization: 'Bearer' } });
    const next = jest.fn();
    verifyJWTToken(req, res, next);
    expect(res._status).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should respond with 403 when the token is invalid', () => {
    jwtToken.checkJWTToken.mockReturnValueOnce({ valid: false, error: 'invalid' });
    const { req, res } = createReqRes({ headers: { authorization: 'Bearer abc' } });
    const next = jest.fn();
    verifyJWTToken(req, res, next);
    expect(res._status).toBe(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('should respond with 403 when the token is valid but req.user is missing', () => {
    jwtToken.checkJWTToken.mockReturnValueOnce({ valid: true, decoded: { id: 1 } });
    const { req, res } = createReqRes({ headers: { authorization: 'Bearer abc' } });
    const next = jest.fn();
    verifyJWTToken(req, res, next);
    expect(res._status).toBe(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next when the token is valid and req.user is present', () => {
    jwtToken.checkJWTToken.mockReturnValueOnce({ valid: true, decoded: { id: 1 } });
    const { req, res } = createReqRes({ headers: { authorization: 'Bearer abc' }, user: { id: 1 } });
    const next = jest.fn();
    verifyJWTToken(req, res, next);
    expect(res._status).toBeNull();
    expect(next).toHaveBeenCalled();
  });
});

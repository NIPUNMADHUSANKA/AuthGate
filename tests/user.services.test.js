// Jest unit its for src/services/user.services.js

jest.mock('../src/services/dbConnection', () => ({
  query: jest.fn(),
}));

const db = require('../src/services/dbConnection');
const services = require('../src/services/user.services');

describe('user.services', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should insert a user and return the id and email', async () => {
    db.query.mockResolvedValueOnce([{ insertId: 42 }]);
    const res = await services.saveUser({ email: 'user@example.com', password: 'hash' });
    expect(res).toEqual({ id: 42, email: 'user@example.com' });
  });

  it('should insert a refresh token and return the user_id, token_hash, expires_at ', async()=>{
    db.query.mockResolvedValueOnce([{insertId: 50}]);
    const res = await services.saveToken(42, 'h', 3000 );
    expect(res).toEqual({id: 50, user_id: 42, expires_at:3000})
  })

  it('should return the first user row when queried by email', async () => {
    db.query.mockResolvedValueOnce([[{ id: 1, password_hash: 'h', email_verified: 1 }]]);
    const row = await services.getUserByEmail('user@example.com');
    expect(row).toEqual({ id: 1, password_hash: 'h', email_verified: 1 });
  });

  it('should return true if a refresh token is deleted (affectedRows > 0)', async () => {
    db.query.mockResolvedValueOnce([{ affectedRows: 0 }]);
    const r1 = await services.deleteRefreshToken(7);
    expect(r1).toBe(false);
    db.query.mockResolvedValueOnce([{ affectedRows: 2 }]);
    const r2 = await services.deleteRefreshToken(7);
    expect(r2).toBe(true);
  });

  it('should return true if the user account is activated (affectedRows > 0)', async () => {
    db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const ok = await services.userAccountActivate(3, true);
    expect(ok).toBe(true);
  });

  it('should return true when the user account and sessions are deleted (affectedRows > 0)', async () => {
    // First delete users
    db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
    // Then delete sessions
    db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const ok = await services.deleteUserAccountService(5);
    expect(ok).toBe(true);
  });
});


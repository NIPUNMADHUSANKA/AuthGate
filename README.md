# AuthGate

Modern, minimal authentication gateway built with Express.js. This README gives you a clean starting point with setup, environment config, and example endpoints. Tailor sections to match your actual implementation.

## Table of Contents
- Overview
- Features
- Tech Stack
- Prerequisites
- Getting Started
- Configuration
- API Endpoints
- Project Structure
- Scripts
- Security Notes
- Troubleshooting
- Contributing
- License

## Overview
AuthGate handles user signup and login (local + Google OAuth), access/refresh token management, email verification, password resets, session/status validation, and role-based access to protected resources, with a lightweight, extensible design.

## Features
- Local authentication with email/password (Passport Local strategy)
- Google OAuth2 authentication
- JWT-based stateless sessions (access + refresh tokens)
- Protected routes with middleware (verifyJWTToken, checkUserRole)
- Session management
- Email verification and re-verification flow
- Password reset support (forgot + change password endpoints)
- Refresh token rotation and logout handling
- Account management (delete account endpoint)
- Rate limiting (authLimiter) on sensitive routes
- Extensible design for adding more providers and storage layers
- Customizable request/response shapes and structured error handling

## Tech Stack
- Node.js + Express.js
- Passport.js — authentication strategies (Local, Google OAuth2)
- JSON Web Tokens (JWT)
- PostgreSQL
- Dotenv — environment-based configuration management
- Express Middleware — for validation, request limiting, and error handling
- Jest / Vitest — unit & integration testing framework
- nodemailer — email delivery (verification, password reset)

## Prerequisites
- Node.js 18+ and npm 9+
- Git (to clone)
- Database (e.g., MySQL/Postgres/SQLite) if you plan to persist users  

## Getting Started
1) Clone the repository
   git clone https://github.com/NIPUNMADHUSANKA/AuthGate.git

   **cd AuthGate**

3) Install dependencies

   **npm ci**

5) Configure environment
   - Copy the sample values below into a `.env` file.
   - Adjust to your environment.

6) Run in development

   **npm run dev**

8) Build and run in production

   **npm start**

## Configuration
In the ./src/config/ directory, create a .env file and define the following variables:

PORT=3000

**Database** <br>
DATABASE_URL=DATABASE_URL <br>

**Tokens** <br>
JWT_ACCESS_SECRET=replace-with-strong-secret <br>
JWT_REFRESH_SECRET=replace-with-strong-secret <br>
JWT_ACCESS_EXPIRES_IN=15m <br>
JWT_REFRESH_EXPIRES_IN=7d <br>
JWT_EMAIL_SECRET=replace-with-strong-secret <br>
JWT_EMAIL_EXPIRES_IN= 1d <br>

**App** <br>
SESSION_SECRET=replace-with-strong-random-string <br>

**SMTP (Mail)** <br>
SMTP_HOST=smtp.example.com <br>
SMTP_PORT=465 <br>
SMTP_USER=replace-with-username <br>
SMTP_PASS=replace-with-password <br>
MAIL_FROM="AuthGate <no-reply@yourapp.com>" <br>

**Google OAuth2** <br>
GOOGLE_CLIENT_ID=replace-with-client-id <br>
GOOGLE_CLIENT_SECRET=replace-with-client-secret <br>
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/login/google/callback <br>

# Example database 
src/config/database.md

Notes:
- Use long, random values for secrets.
- Keep secrets out of version control and rotation-safe in production.

## API Endpoints
<img width="1918" height="1017" alt="image" src="https://github.com/user-attachments/assets/9cf62ba2-50be-4051-b5a0-981d523310ef" />
<br>
<img width="1877" height="680" alt="image" src="https://github.com/user-attachments/assets/bd9c340b-e32c-4c76-9d6f-dfc95c98b90c" />


## Project Structure

```text
src/
├── app.js         # Express app bootstrap
├── server.js      # HTTP server (loads and runs the app)
│
├── routes/        # Route definitions
├── controllers/   # Request handlers (map routes → services)
├── middlewares/   # Auth, validation, error handling
├── services/      # Business logic (e.g., tokens, users, DB access)
├── utils/         # Utility helpers (validation, formatters, etc.)
├── config/        # Environment and configuration helpers (.env)
└── tests/         # Unit and integration tests
```

## Scripts
Common npm scripts to consider:
- **npm run dev**    -        Start in watch mode (e.g., nodemon)
- **npm start**      -        Start production build
- **npm test**       -        Run tests

## Security Notes
- Always run behind **HTTPS** in production to protect tokens and credentials.  
- Store **JWT secrets** (`JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`) securely (e.g., in environment variables or a secret manager) and rotate them periodically.  
- Use strong, random values for `SESSION_SECRET`.  
- Set **secure cookie flags** if using cookies (`HttpOnly`, `Secure`, `SameSite=strict`).  
- Apply **rate limiting** (`authLimiter`) to sensitive routes such as register, login, password reset, and verification.  
- Validate and sanitize all incoming data using the provided validation middlewares (`validateUser`, `validateChangePasswordDetails`, etc.).  
- Enforce **role-based access control** with `checkUserRole` for protected endpoints (e.g., delete account, logout).  
- Expire and rotate **refresh tokens** regularly to reduce replay risks.  
- Remove or restrict sensitive error messages (don’t leak stack traces in production).  


## Troubleshooting

- **App won’t start**
  - Ensure `.env` is loaded (path: `./src/config/.env`, `require('dotenv').config({ path: './src/config/.env' })`).
  - Verify Node.js version (18+) and `npm ci` completed without errors.
  - Check DATABASE_URL and that the DB is reachable.
  - Port already in use? Change `PORT` or free the port.

- **401 on protected routes**
  - Send `Authorization: Bearer <accessToken>`.
  - Confirm token isn’t expired and `JWT_ACCESS_SECRET` matches the one used to sign it.
  - Middleware order: `verifyJWTToken` must run **before** `checkUserRole`.

- **Token refresh fails**
  - Validate the refresh token is present and unexpired (`JWT_REFRESH_EXPIRES_IN`).
  - Secrets must match across environments (`JWT_REFRESH_SECRET`).
  - If you store refresh tokens in DB, ensure it exists/is not revoked.
  - Clock skew: server/system time should be correct (NTP).

- **Google OAuth issues**
  - `GOOGLE_CALLBACK_URL` in `.env` must exactly match the URL in Google Cloud Console.
  - Callback route exists: `GET /api/auth/login/google/callback`.
  - Using `state: true`? Don’t strip query/fragment data during redirects.
  - Local dev over HTTP: allowed in console? Otherwise use HTTPS tunneling.

- **Email (verify/forgot-password) not sending**
  - Check `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`.
  - Port/secure mismatch: 465 (implicit TLS) vs 587 (STARTTLS).
  - Some providers require app passwords or “less secure app” settings.

- **Login (local) always failing**
  - Ensure `passport-local` strategy is registered and used in the login route.
  - Password hashing: verify compare function (e.g., `bcrypt.compare`) matches how you stored the hash.
  - Validation middlewares (`validateUser`) aren’t rejecting payloads silently.

- **RBAC / Authorization errors**
  - `checkUserRole` expects roles/claims on `req.user`. Ensure `verifyJWTToken` attaches them.
  - Tokens issued before role changes may need re-issue.

- **Session/Logout behaves inconsistently**
  - If using cookies, set proper flags: `HttpOnly`, `SameSite`, `Secure` (HTTPS in prod).
  - Clear both **access** and **refresh** tokens on logout; revoke DB-stored refresh tokens if used.

- **CORS / frontend calling API**
  - Enable CORS with correct `origin`, `credentials` if sending cookies.
  - Preflight (OPTIONS) must be handled for non-simple requests.

- **Generic debugging tips**
  - Enable structured logs for auth flows (redact secrets/tokens).
  - Return safe error messages in prod (avoid stack traces).

## Contributing ##
We welcome contributions from the community to help improve **AuthGate**! Whether it’s fixing bugs, improving documentation, or adding new features, your help is appreciated.

## License
Add your chosen license (e.g., MIT) in a `LICENSE` file and reference it here.

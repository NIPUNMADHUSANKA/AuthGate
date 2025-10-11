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
- MySQL
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
DB_HOST=localhost <br>
DB_USER=root <br>
DB_PASSWORD=replace-with-password <br>
DB_NAME=authgate <br>
DB_PORT=3306 <br>
DB_POOL_SIZE=10 <br>

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
Below are example shapes. Align them with your implementation.

POST /api/auth/register
Request: { "email": "user@example.com", "password": "StrongP@ssw0rd" }
Response: 201 Created { "id": "...", "email": "user@example.com" }

POST /api/auth/login
Request: { "email": "user@example.com", "password": "StrongP@ssw0rd" }
Response: 200 OK { "accessToken": "...", "refreshToken": "..." }

POST /api/auth/refresh
Request: { "refreshToken": "..." }
Response: 200 OK { "accessToken": "...", "refreshToken": "..." }

POST /api/auth/logout
Request: { "refreshToken": "..." }
Response: 204 No Content

GET /api/users/me
Headers: Authorization: Bearer <accessToken>
Response: 200 OK { "id": "...", "email": "user@example.com" }

## Project Structure

src/
  app.js            Express app bootstrap
  server.js         HTTP server (bootstraps app)
  routes/           Route definitions
  controllers/      Request handlers
  middlewares/      Auth + error middlewares
  services/         Business logic (e.g., token, user, DB)
  utils/            Helpers (validation)
  config/           Env + configuration helpers (.env)
tests/              Unit/integration tests

## Scripts
Common npm scripts to consider:
- npm run dev            Start in watch mode (e.g., nodemon)
- npm start              Start production build
- npm test               Run tests

## Security Notes
- Always use HTTPS in production.
- Store JWT secrets securely and rotate periodically.
- Set secure cookie flags (if using cookies): HttpOnly, Secure, SameSite.
- Implement rate limiting and request size limits.
- Validate and sanitize all inputs.

## Troubleshooting
- App won’t start: verify `.env` values and Node version.
- 401 on protected routes: ensure Authorization header contains a valid access token.
- Token refresh fails: confirm refresh token validity and matching secret.

## Contributing
Issues and PRs are welcome. Please include clear descriptions, steps to reproduce, and tests where applicable.

## License
Add your chosen license (e.g., MIT) in a `LICENSE` file and reference it here.

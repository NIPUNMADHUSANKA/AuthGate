const passport = require("passport");
const { userRegister, loginUser, refreshUserToken, userLogout, userActivate, resendVerificationEmail, deleteUserAccount, sendChangePasswordEmail, ChangePassword } = require("../controllers/user.controllers");
const { validateUser, checkUserRole, verifyJWTToken, validateActivateAccount, validateResendVerificationEmail, validforgetPasswordEmail, validateChangePasswordDetails, validateChangePasswordUrl } = require("../middlewares/user.middlewares");
const { authLimiter } = require("../utils/rateLimiting");
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const userrouter = require("express").Router();

const swaggerOptions = {
        definition: {
            openapi: '3.0.0',
            info: {
                title: 'AuthGate',
                version: '1.0.0',
                description:'AuthGate is a modern authentication gateway built with Node.js and Express.js. It provides secure user signup/login, Google OAuth2, JWT-based session management, email verification, password resets, and role-based access control — all in a lightweight, extensible design.',
            },
            servers: [{ url: 'http://localhost:3000' }],
            components: {
              securitySchemes: {
                bearerAuth: {
                  type: 'http',
                  scheme: 'bearer',
                  bearerFormat: 'JWT',
                },
              },
            },
        },
        apis: ['src/routes/*.js'],
};

const swaggerSpec = swaggerJsDoc(swaggerOptions);
userrouter.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account with email and password. 
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: test@gmail.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: StrongP@ssw0rd
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: 123
 *                 email:
 *                   type: string
 *                   example: user@example.com
 *                 message:
 *                   type: string
 *                   example: User registered successfully. Please check your email to verify your account.
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Duplicate entry 'test@gmail.com' for key 'users.email'
 */
userrouter.post('/api/auth/register', authLimiter, validateUser, userRegister);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Login with email and password
 *     description: Authenticates a user using local strategy and issues access/refresh tokens.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: StrongP@ssw0rd
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6...
 *                 refreshToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6...
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Invalid email or password
 */
userrouter.post('/api/auth/login', authLimiter, validateUser, passport.authenticate("local"), loginUser);

// Google OAuth: initiate
/**
 * @openapi
 * /api/auth/login/google:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Initiate Google OAuth2 login
 *     description: Redirects the client to Google’s OAuth 2.0 consent screen. No response body is returned; a 302 redirect is issued.
 *     operationId: initiateGoogleOAuth
 *     security: []  # Public endpoint
 *     responses:
 *       '302':
 *         description: Redirect to Google OAuth consent page
 *         headers:
 *           Location:
 *             description: Google authorization URL to redirect the client.
 *             schema:
 *               type: string
 *               format: uri
 *         content: {}
 *       '429':
 *         description: Too Many Requests (rate limited)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
userrouter.get('/api/auth/login/google', authLimiter, passport.authenticate('google', { scope: ['email', 'profile'], state: true }));

// Google OAuth: callback
/**
 * @openapi
 * /api/auth/login/google/callback:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Google OAuth2 callback
 *     description: Handles the OAuth2 callback from Google. On success, issues access and refresh tokens. On failure, redirects to the login page with an error query.
 *     operationId: googleOAuthCallback
 *     security: []
 *     responses:
 *       '201':
 *         description: Login successful via Google OAuth2
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6...
 *                 refreshToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6...
 *       '302':
 *         description: Redirect on OAuth failure
 *         headers:
 *           Location:
 *             description: Redirect target with error details
 *             schema:
 *               type: string
 *               example: /login?error=oauth
 *       '429':
 *         description: Too Many Requests (rate limited)
 *       '500':
 *         description: Internal Server Error
 */
userrouter.get('/api/auth/login/google/callback', authLimiter, passport.authenticate('google', { failureRedirect: '/login?error=oauth' }),loginUser);

/**
 * @openapi
 * /api/auth/status:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Get current auth status
 *     description: Returns the authenticated user's profile if a valid Bearer token is provided and the user has an allowed role (user or admin).
 *     operationId: getAuthStatus
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         description: Bearer access token
 *         schema:
 *           type: string
 *           example: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6...
 *     responses:
 *       '200':
 *         description: Authenticated user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 123
 *                 email:
 *                   type: string
 *                   format: email
 *                   example: user@example.com
 *                 role:
 *                   type: string
 *                   example: user
 *       '401':
 *         description: Missing or invalid token
 *         content: {}
 *       '403':
 *         description: Forbidden (invalid token or insufficient role)
 *         content: {}
 */
userrouter.get('/api/auth/status', verifyJWTToken, checkUserRole, (req,res)=>{
    return req.user ? res.send(req.user) : res.sendStatus(401);
})

/**
 * @openapi
 * /api/auth/refreshToken:
 *   post:
 *     tags:
 *       - Tokens
 *     summary: Refresh access token
 *     description: Exchanges a valid refresh token for a new access token.
 *     operationId: refreshAccessToken
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Refresh token issued during login
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6...
 *     responses:
 *       '200':
 *         description: New access token issued
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6...
 *       '401':
 *         description: Missing refresh token
 *         content: {}
 *       '403':
 *         description: Invalid or expired refresh token
 *         content: {}
 *       '429':
 *         description: Too Many Requests (rate limited)
 *       '500':
 *         description: Internal Server Error
 */
userrouter.post('/api/auth/refreshToken', authLimiter, refreshUserToken);

/**
 * @openapi
 * /api/auth/logout:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Logout current user
 *     description: Deletes the user's refresh token and ends the session.
 *     operationId: logoutUser
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logged out successfully
 *       '400':
 *         description: Logout failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logout Failed
 *       '401':
 *         description: Unauthorized (no user in context)
 *         content: {}
 *       '403':
 *         description: Forbidden (insufficient role)
 *         content: {}
 *       '500':
 *         description: Internal Server Error
 */
userrouter.get('/api/auth/logout', checkUserRole, userLogout);

/**
 * @openapi
 * /api/auth/verify:
 *   get:
 *     tags:
 *       - Account Verification
 *     summary: Verify user email
 *     description: Validates the verification token and activates the user's account if valid. If already activated, returns a confirmation message.
 *     operationId: verifyEmail
 *     security: []
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         description: Email verification token
 *         schema:
 *           type: string
 *       - in: query
 *         name: uid
 *         required: true
 *         description: User ID to verify
 *         schema:
 *           type: integer
 *           example: 123
 *     responses:
 *       '200':
 *         description: Email verified or already activated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Email verified! You can now log in.
 *       '400':
 *         description: Missing or invalid token/uid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Missing token or uid in query parameters
 *       '404':
 *         description: User not found
 *         content: {}
 *       '429':
 *         description: Too Many Requests (rate limited)
 *       '500':
 *         description: Internal Server Error
 */
userrouter.get('/api/auth/verify', authLimiter, validateActivateAccount, userActivate )

/**
 * @openapi
 * /api/auth/resend-verification/{id}:
 *   post:
 *     tags:
 *       - Account Verification
 *     summary: Resend verification email
 *     description: Sends a new verification email to the specified user. If the account is already activated, returns a confirmation message.
 *     operationId: resendVerificationEmail
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User ID to resend the verification email for
 *         schema:
 *           type: integer
 *           example: 123
 *     responses:
 *       '201':
 *         description: Verification email resent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Verification email resent successfully. Please check your inbox.
 *       '200':
 *         description: Account already activated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Account already activated
 *       '400':
 *         description: Missing id in params
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Missing id in params
 *       '404':
 *         description: User not found
 *         content: {}
 *       '429':
 *         description: Too Many Requests (rate limited)
 *       '500':
 *         description: Internal Server Error
 */
userrouter.post('/api/auth/resend-verification/:id', authLimiter, validateResendVerificationEmail, resendVerificationEmail);

/**
 * @openapi
 * /api/auth/deleteAccount/{id}:
 *   delete:
 *     tags:
 *       - Account Management
 *     summary: Delete current user account
 *     description: Deletes the authenticated user's account. The requester must be the account owner.
 *     operationId: deleteUserAccount
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the user to delete (must match the authenticated user)
 *         schema:
 *           type: integer
 *           example: 123
 *     responses:
 *       '200':
 *         description: Account deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Your account has been successfully deleted.
 *       '401':
 *         description: Unauthorized (missing token or no user in context)
 *         content: {}
 *       '403':
 *         description: Forbidden (invalid token or not the account owner)
 *         content: {}
 *       '404':
 *         description: User account could not be found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User account could not be found.
 *       '500':
 *         description: Internal Server Error
 */
userrouter.delete('/api/auth/deleteAccount/:id', verifyJWTToken, checkUserRole, deleteUserAccount)

/**
 * @openapi
 * /api/auth/forgot-password:
 *   post:
 *     tags:
 *       - Password Management
 *     summary: Send password reset email
 *     description: Sends a password reset email containing a secure token if the email exists.
 *     operationId: sendForgotPasswordEmail
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       '201':
 *         description: Password reset email sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password reset email has been sent successfully. Please check your inbox.
 *       '400':
 *         description: Invalid request body
 *       '404':
 *         description: User not found
 *       '429':
 *         description: Too Many Requests (rate limited)
 *       '500':
 *         description: Internal Server Error
 */
userrouter.post('/api/auth/forgot-password', authLimiter, validforgetPasswordEmail, sendChangePasswordEmail)

/**
 * @openapi
 * /api/auth/change-password:
 *   post:
 *     tags:
 *       - Password Management
 *     summary: Change password using reset token
 *     description: Updates the user's password using a valid email reset token and matching password fields.
 *     operationId: changePassword
 *     security: []
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         description: Password reset token from email
 *         schema:
 *           type: string
 *       - in: query
 *         name: uid
 *         required: true
 *         description: User ID associated with the reset token
 *         schema:
 *           type: integer
 *           example: 123
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newPassword
 *               - newPasswordConfirm
 *             properties:
 *               newPassword:
 *                 type: string
 *                 example: NewStr0ngP@ss
 *               newPasswordConfirm:
 *                 type: string
 *                 example: NewStr0ngP@ss
 *     responses:
 *       '200':
 *         description: Password updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password updated successfully.
 *       '400':
 *         description: Missing/invalid token or body validation failed
 *       '429':
 *         description: Too Many Requests (rate limited)
 *       '500':
 *         description: Internal Server Error
 */
userrouter.post('/api/auth/change-password', authLimiter, validateChangePasswordUrl, validateChangePasswordDetails, ChangePassword);

module.exports = userrouter; 

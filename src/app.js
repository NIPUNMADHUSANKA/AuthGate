require('dotenv').config({ path: './src/config/.env' });
const express = require('express');
// Initialize DB connection (pool) on startup
require('./services/dbConnection');
const userrouter = require('./routes/user.routes');
const { errorHandler } = require('./utils/error');
const session = require('express-session');
const passport = require('passport');
// Register Passport strategies and serializers
require('./config/passport');
const app = express();
const MySQLStoreFactory = require('express-mysql-session');
const dbConnection = require('./services/dbConnection');
const { globalLimiter } = require('./utils/rateLimiting');
const helmet = require('helmet');
const cors = require('cors');

app.use(cors({
    origin: 'http://localhost:4200',   // your frontend origin
    credentials: true, //allow cookies/ Authorization headers
    methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}))

app.use(globalLimiter);
app.use(helmet({
  contentSecurityPolicy: false, // keep CSP off for quick demos to avoid asset blocking
  noSniff: true,  // prevents a .txt file from being executed as JavaScript.
  frameguard: { action: 'deny' }, //Protects against clickjacking attacks (attackers overlay hidden buttons)
  referrerPolicy: { policy: 'no-referrer' }, //This means other sites won’t see which page on your app the user came from → more privacy
  crossOriginResourcePolicy: { policy: 'same-site' },
  crossOriginOpenerPolicy: { policy: 'same-origin' },
  hsts: false, // leave OFF for localhost (no HTTPS)
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const MySQLStore = MySQLStoreFactory(session);
const sessionStore = new MySQLStore({
    createDatabaseTable: true,
    clearExpired: true,
    checkExpirationInterval: 900000,
    expiration: 86400000,   
}, dbConnection)

app.use(session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
    cookie:{ maxAge: 1000 * 60 * 60 },
    store: sessionStore
}));

app.use(passport.initialize());
app.use(passport.session());

// Initialize routes
app.use(userrouter)

// Error handling should be last
app.use(errorHandler);


module.exports = app;


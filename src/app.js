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


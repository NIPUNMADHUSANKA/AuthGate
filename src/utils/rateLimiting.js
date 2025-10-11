const rateLimit = require('express-rate-limit');


// Auth-specific brute-force limiter (tighter)
const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  standardHeaders: true, //binds metadata (like rate limit their quota) into the response headers, and frontend can use it.
  legacyHeaders: false, //binds metadata (like rate limit their quota) into the response headers with old way "X" use as prefix, and frontend can use it.
  message: { message: 'Too many attempts. Please try again later.' },
});


const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many attempts. Please try again later.' },
})


module.exports = {authLimiter, globalLimiter};
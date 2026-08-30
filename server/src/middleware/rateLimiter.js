const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    message: { success: false, message: 'Too many auth requests from this IP, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: { success: false, message: 'Too many API requests from this IP, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    authLimiter,
    apiLimiter
};

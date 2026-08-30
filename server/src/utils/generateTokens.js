const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const generateVerificationToken = () => {
    return {
        token: crypto.randomBytes(32).toString('hex'),
        expiry: Date.now() + 24 * 60 * 60 * 1000
    };
};

const generateResetToken = () => {
    return {
        token: crypto.randomBytes(32).toString('hex'),
        expiry: Date.now() + 60 * 60 * 1000
    };
};

const generateJWT = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET || 'secret', {
        expiresIn: process.env.JWT_EXPIRES_IN || '1d'
    });
};

module.exports = {
    generateVerificationToken,
    generateResetToken,
    generateJWT
};

const validateRegistration = (req, res, next) => {
    const { name, email, password, confirmPassword } = req.body;
    const errors = {};

    if (!name || name.trim().length < 2) {
        errors.name = 'Name is required and must be at least 2 characters';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        errors.email = 'Valid email is required';
    }

    if (!password || password.length < 8 || !/\d/.test(password)) {
        errors.password = 'Password must be at least 8 characters and contain a number';
    }

    if (password !== confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ success: false, message: 'Validation failed', data: errors });
    }

    next();
};

const validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    const errors = {};

    if (!email) errors.email = 'Email is required';
    if (!password) errors.password = 'Password is required';

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ success: false, message: 'Validation failed', data: errors });
    }

    next();
};

const validateForgotPassword = (req, res, next) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ success: false, message: 'Validation failed', data: { email: 'Email is required' } });
    }
    next();
};

const validateResetPassword = (req, res, next) => {
    const { token, newPassword } = req.body;
    const errors = {};

    if (!token) errors.token = 'Token is required';
    if (!newPassword || newPassword.length < 8 || !/\d/.test(newPassword)) {
        errors.newPassword = 'New password must be at least 8 characters and contain a number';
    }

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ success: false, message: 'Validation failed', data: errors });
    }

    next();
};

module.exports = {
    validateRegistration,
    validateLogin,
    validateForgotPassword,
    validateResetPassword
};

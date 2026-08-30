export const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const validatePassword = (password) => {
  if (!password || password.length < 8) return 'Password must be at least 8 characters';
  if (!/\d/.test(password)) return 'Password must contain at least one number';
  return null;
};

export const validatePhone = (phone) => /^[0-9]{10}$/.test(phone);

export const validateRequired = (value, fieldName) => {
  if (!value || !value.toString().trim()) return `${fieldName} is required`;
  return null;
};

export const getPasswordStrength = (password) => {
  if (!password) return 0;
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  return strength;
};

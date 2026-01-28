/**
 * Validation utility functions for authentication forms
 */

export const validateEmail = (email) => {
  if (!email || email.trim() === '') {
    return { valid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { valid: false, error: 'Please enter a valid email address' };
  }

  return { valid: true, error: null };
};


export const validatePassword = (password, minLength = 6) => {
  if (!password || password.trim() === '') {
    return { valid: false, error: 'Password is required' };
  }

  if (password.length < minLength) {
    return { valid: false, error: `Password must be at least ${minLength} characters long` };
  }

  return { valid: true, error: null };
};


export const validateName = (name, fieldName = 'Name', minLength = 2) => {
  if (!name || name.trim() === '') {
    return { valid: false, error: `${fieldName} is required` };
  }

  if (name.trim().length < minLength) {
    return { valid: false, error: `${fieldName} must be at least ${minLength} characters long` };
  }

  // Allow letters, spaces, hyphens, and apostrophes
  const nameRegex = /^[a-zA-Z\s'-]+$/;
  if (!nameRegex.test(name.trim())) {
    return { valid: false, error: `${fieldName} can only contain letters, spaces, hyphens, and apostrophes` };
  }

  return { valid: true, error: null };
};


export const validatePasswordMatch = (password, confirmPassword) => {
  if (!confirmPassword || confirmPassword.trim() === '') {
    return { valid: false, error: 'Please confirm your password' };
  }

  if (password !== confirmPassword) {
    return { valid: false, error: 'Passwords do not match' };
  }

  return { valid: true, error: null };
};


export const validateSignIn = (form) => {
  const errors = {};
  
  const emailValidation = validateEmail(form.email);
  if (!emailValidation.valid) {
    errors.email = emailValidation.error;
  }

  const passwordValidation = validatePassword(form.password);
  if (!passwordValidation.valid) {
    errors.password = passwordValidation.error;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};


export const validateRegister = (form, strength) => {
  const errors = {};

  const firstNameValidation = validateName(form.first_name, 'First name');
  if (!firstNameValidation.valid) {
    errors.first_name = firstNameValidation.error;
  }

  const lastNameValidation = validateName(form.last_name, 'Last name');
  if (!lastNameValidation.valid) {
    errors.last_name = lastNameValidation.error;
  }

  const companyNameValidation = validateName(form.company_name, 'Company name', 2);
  if (!companyNameValidation.valid) {
    errors.company_name = companyNameValidation.error;
  }

  const emailValidation = validateEmail(form.email);
  if (!emailValidation.valid) {
    errors.email = emailValidation.error;
  }

  const passwordValidation = validatePassword(form.password);
  if (!passwordValidation.valid) {
    errors.password = passwordValidation.error;
  } else if (strength?.value === 'Too weak') {
    errors.password = 'Password is too weak. Please choose a stronger password.';
  }

  const confirmPasswordValidation = validatePasswordMatch(form.password, form.confirm_password);
  if (!confirmPasswordValidation.valid) {
    errors.confirm_password = confirmPasswordValidation.error;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};


export const validateResetPassword = (form) => {
  const errors = {};

  const emailValidation = validateEmail(form.email);
  if (!emailValidation.valid) {
    errors.email = emailValidation.error;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};


export const validateUpdatePassword = (form, strength) => {
  const errors = {};

  const passwordValidation = validatePassword(form.password);
  if (!passwordValidation.valid) {
    errors.password = passwordValidation.error;
  } else if (strength?.value === 'Too weak') {
    errors.password = 'Password is too weak. Please choose a stronger password.';
  }

  const confirmPasswordValidation = validatePasswordMatch(form.password, form.confirmPassword);
  if (!confirmPasswordValidation.valid) {
    errors.confirmPassword = confirmPasswordValidation.error;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

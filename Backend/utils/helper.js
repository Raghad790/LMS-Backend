// Remove sensitive fields from user object
// utils/helper.js - Updated sanitizedUser function
export const sanitizedUser = (user) => {
  const { id, email, name, avatar, oauth_provider, oauth_id, is_active, created_at, role } = user;
  
  // Include name in returned object, extract from email if not available
  return { 
    id, 
    email, 
    name: name || email.split('@')[0], // Use name or extract from email 
    avatar, 
    oauth_provider, 
    oauth_id, 
    is_active, 
    created_at, 
    role 
  };
};
// Generate a random string of given length
export const generateRandomString = (length = 32) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Validate email format
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Standard API response format
export const createResponse = (success, message, data = null, error = null) => {
  return {
    success,
    message,
    data,
    error,
    timestamp: new Date().toISOString()
  };
};
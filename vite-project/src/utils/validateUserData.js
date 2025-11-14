/**
 * Custom error classes for specific validation errors
 */
export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class AgeError extends ValidationError {
  constructor(message) {
    super(message);
    this.name = 'AgeError';
  }
}

export class EmailError extends ValidationError {
  constructor(message) {
    super(message);
    this.name = 'EmailError';
  }
}

/**
 * Validates user data and throws specific errors for invalid input
 * @param {Object} userData - User data to validate
 * @param {string} userData.name - User's name
 * @param {number} userData.age - User's age
 * @param {string} userData.email - User's email
 * @throws {ValidationError} If input is not an object or required fields are missing
 * @throws {AgeError} If age is invalid
 * @throws {EmailError} If email is invalid
 * @returns {boolean} Returns true if all validations pass
 */
export function validateUserData(userData) {
  // Check if input is an object
  if (!userData || typeof userData !== 'object' || Array.isArray(userData)) {
    throw new ValidationError('Input must be an object');
  }

  // Validate individual fields first if they exist
  if (userData.name !== undefined && (typeof userData.name !== 'string' || userData.name.trim().length < 2)) {
    throw new ValidationError('Name must be a string with at least 2 characters');
  }

  if (userData.age !== undefined && (!Number.isInteger(userData.age) || userData.age < 0 || userData.age > 120)) {
    throw new AgeError('Age must be an integer between 0 and 120');
  }

  if (userData.email !== undefined) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (typeof userData.email !== 'string' || !emailRegex.test(userData.email)) {
      throw new EmailError('Invalid email format');
    }
  }

  // Check required fields after validating individual fields
  if (userData.name === undefined || userData.age === undefined || userData.email === undefined) {
    throw new ValidationError('Missing required fields');
  }

  return true;
}
import { describe, it, expect } from 'vitest';
import { validateUserData, ValidationError, AgeError, EmailError } from './validateUserData';

// Valid user object for testing - defined at the top so we can use it in all tests
const validUser = {
  name: 'John Doe',
  age: 30,
  email: 'john@example.com'
};

describe('validateUserData', () => {
  describe('valid cases', () => {
    it('should return true for valid user data', () => {
      expect(() => validateUserData(validUser)).not.toThrow();
      expect(validateUserData(validUser)).toBe(true);
    });

    it('should accept minimum valid values', () => {
      const minimalUser = {
        name: 'Jo',     // Minimum 2 characters
        age: 0,         // Minimum age
        email: 'a@b.c'  // Minimum valid email format
      };
      
      const result = validateUserData(minimalUser);
      expect(result).toBe(true);
    });
  });

  describe('input type validation', () => {
    it('should throw ValidationError for non-object input', () => {
      const invalidInputs = [null, undefined, 42, 'string', [], true];
      
      invalidInputs.forEach(input => {
        expect(() => validateUserData(input))
          .toThrow(ValidationError);
        expect(() => validateUserData(input))
          .toThrow('Input must be an object');
      });
    });

    it('should throw ValidationError for missing required fields', () => {
      const incompleteUsers = [
        { name: 'John', age: 30 },           // Missing email
        { name: 'John', email: 'a@b.c' },    // Missing age
        { age: 30, email: 'a@b.c' },         // Missing name
        {}                                    // Missing all fields
      ];

      incompleteUsers.forEach(user => {
        expect(() => validateUserData(user))
          .toThrow(ValidationError);
        expect(() => validateUserData(user))
          .toThrow('Missing required fields');
      });
    });
  });

  describe('name validation', () => {
    it('should throw ValidationError for invalid names', () => {
      const invalidNames = [
        { name: '', age: 30, email: 'test@example.com' },              // Empty string
        { name: ' ', age: 30, email: 'test@example.com' },             // Only whitespace
        { name: 'a', age: 30, email: 'test@example.com' },             // Too short
        { name: 42, age: 30, email: 'test@example.com' },              // Wrong type
        { name: ['John'], age: 30, email: 'test@example.com' }         // Wrong type
      ];

      invalidNames.forEach(user => {
        expect(() => validateUserData(user))
          .toThrow(ValidationError);
        expect(() => validateUserData(user))
          .toThrow('Name must be a string with at least 2 characters');
      });
    });
  });

  describe('age validation', () => {
    it('should throw AgeError for invalid ages', () => {
      const invalidAges = [
        { name: 'John', age: -1, email: 'test@example.com' },           // Negative age
        { name: 'John', age: 121, email: 'test@example.com' },          // Too old
        { name: 'John', age: 30.5, email: 'test@example.com' },         // Float
        { name: 'John', age: '30', email: 'test@example.com' },         // String
        { name: 'John', age: null, email: 'test@example.com' }          // Null
      ];

      invalidAges.forEach(user => {
        expect(() => validateUserData(user))
          .toThrow(AgeError);
        expect(() => validateUserData(user))
          .toThrow('Age must be an integer between 0 and 120');
      });
    });
  });

  describe('email validation', () => {
    it('should throw EmailError for invalid email formats', () => {
      const invalidEmails = [
        { name: 'John', age: 30, email: '' },             // Empty string
        { name: 'John', age: 30, email: 'notanemail' },   // No @ symbol
        { name: 'John', age: 30, email: 'no@domain' },    // No TLD
        { name: 'John', age: 30, email: '@nodomain.com' }, // No local part
        { name: 'John', age: 30, email: 'spaces @in.it' }, // Contains spaces
        { name: 'John', age: 30, email: ['email'] }       // Wrong type
      ];

      invalidEmails.forEach(user => {
        expect(() => validateUserData(user))
          .toThrow(EmailError);
        expect(() => validateUserData(user))
          .toThrow('Invalid email format');
      });
    });
  });
});
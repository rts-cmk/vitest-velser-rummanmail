import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { handleInput } from './handleInputImpl';

describe('handleInput', () => {
  // Number handling tests
  describe('number handling', () => {
    let testNumbers;
    
    beforeEach(() => {
      testNumbers = [2, 0, -3];
    });

    afterEach(() => {
      testNumbers = null;
    });

    it('doubles finite numbers', () => {
      testNumbers.forEach(num => {
        expect(handleInput(num)).toBe(num * 2);
      });
    });

    it('throws for NaN and Infinity', () => {
      const invalidNumbers = [NaN, Infinity, -Infinity];
      invalidNumbers.forEach(num => {
        expect(() => handleInput(num)).toThrow(TypeError);
      });
    });
  });

  // String handling tests
  describe('string handling', () => {
    let testStrings;

    beforeEach(() => {
      testStrings = {
        padded: '  hello ',
        empty: '',
        mixed: '  HeLLo WoRLD  '
      };
    });

    afterEach(() => {
      testStrings = null;
    });

    it('handles strings by trimming and uppercasing', () => {
      expect(handleInput(testStrings.padded)).toBe('HELLO');
      expect(handleInput(testStrings.empty)).toBe('');
      expect(handleInput(testStrings.mixed)).toBe('HELLO WORLD');
    });
  });

  // Edge cases and error handling
  describe('edge cases and errors', () => {
    let testCases;

    beforeEach(() => {
      testCases = {
        null: null,
        undefined: undefined,
        object: {}
      };
    });

    afterEach(() => {
      testCases = null;
    });

    it('returns null for null input', () => {
      expect(handleInput(testCases.null)).toBeNull();
    });

    it('throws for undefined', () => {
      expect(() => handleInput(testCases.undefined)).toThrow(TypeError);
    });

    it('throws for objects', () => {
      expect(() => handleInput(testCases.object)).toThrow(/Invalid input/);
    });
  });
});

import { InputValidator } from '../../src/inputValidator';

describe('InputValidator', () => {
  describe('validateURL', () => {
    test('should validate correct Box file URL', () => {
      const url = 'https://app.box.com/file/123456789';
      expect(InputValidator.validateURL(url)).toBe(true);
    });

    test('should validate correct Box shared URL', () => {
      const url = 'https://app.box.com/s/abc123';
      expect(InputValidator.validateURL(url)).toBe(true);
    });

    test('should validate Box URL without app subdomain', () => {
      const url = 'https://box.com/file/123456789';
      expect(InputValidator.validateURL(url)).toBe(true);
    });

    test('should reject non-Box URL', () => {
      const url = 'https://example.com/file/123';
      expect(InputValidator.validateURL(url)).toBe(false);
    });

    test('should reject empty string', () => {
      expect(InputValidator.validateURL('')).toBe(false);
    });

    test('should reject null or undefined', () => {
      expect(InputValidator.validateURL(null as any)).toBe(false);
      expect(InputValidator.validateURL(undefined as any)).toBe(false);
    });
  });

  describe('validateFileId', () => {
    test('should validate correct file ID', () => {
      expect(InputValidator.validateFileId('123456789')).toBe(true);
    });

    test('should validate large file ID', () => {
      expect(InputValidator.validateFileId('999999999999999')).toBe(true);
    });

    test('should reject file ID with non-numeric characters', () => {
      expect(InputValidator.validateFileId('123abc')).toBe(false);
    });

    test('should reject file ID with special characters', () => {
      expect(InputValidator.validateFileId('123-456')).toBe(false);
    });

    test('should reject empty string', () => {
      expect(InputValidator.validateFileId('')).toBe(false);
    });

    test('should reject null or undefined', () => {
      expect(InputValidator.validateFileId(null as any)).toBe(false);
      expect(InputValidator.validateFileId(undefined as any)).toBe(false);
    });
  });

  describe('validateContentSize', () => {
    test('should accept content under 50MB', () => {
      const content = 'a'.repeat(10 * 1024 * 1024); // 10MB
      expect(InputValidator.validateContentSize(content)).toBe(true);
    });

    test('should accept empty content', () => {
      expect(InputValidator.validateContentSize('')).toBe(true);
    });

    test('should accept small content', () => {
      expect(InputValidator.validateContentSize('Hello Box')).toBe(true);
    });

    test('should reject content over 50MB', () => {
      const content = 'a'.repeat(51 * 1024 * 1024); // 51MB
      expect(InputValidator.validateContentSize(content)).toBe(false);
    });

    test('should accept content at exactly 50MB', () => {
      const content = 'a'.repeat(50 * 1024 * 1024); // Exactly 50MB
      expect(InputValidator.validateContentSize(content)).toBe(true);
    });
  });

  describe('validateAction', () => {
    test('should validate read action', () => {
      expect(InputValidator.validateAction('read')).toBe(true);
    });

    test('should validate update action', () => {
      expect(InputValidator.validateAction('update')).toBe(true);
    });

    test('should validate info action', () => {
      expect(InputValidator.validateAction('info')).toBe(true);
    });

    test('should reject invalid action', () => {
      expect(InputValidator.validateAction('delete')).toBe(false);
    });

    test('should reject empty string', () => {
      expect(InputValidator.validateAction('')).toBe(false);
    });
  });

  describe('getContentSizeMB', () => {
    test('should calculate size correctly for small content', () => {
      const content = 'a'.repeat(1024 * 1024); // 1MB
      const size = InputValidator.getContentSizeMB(content);
      expect(size).toBeCloseTo(1, 1);
    });

    test('should calculate size correctly for larger content', () => {
      const content = 'a'.repeat(10 * 1024 * 1024); // 10MB
      const size = InputValidator.getContentSizeMB(content);
      expect(size).toBeCloseTo(10, 1);
    });

    test('should return 0 for empty content', () => {
      const size = InputValidator.getContentSizeMB('');
      expect(size).toBe(0);
    });
  });
});

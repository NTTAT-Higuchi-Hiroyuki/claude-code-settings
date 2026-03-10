import { URLParser } from '../../src/urlParser';

describe('URLParser', () => {
  describe('extractFileId', () => {
    test('should extract file ID from standard Box URL', () => {
      const url = 'https://app.box.com/file/123456789';
      expect(URLParser.extractFileId(url)).toBe('123456789');
    });

    test('should extract file ID from Box URL without app subdomain', () => {
      const url = 'https://box.com/file/987654321';
      expect(URLParser.extractFileId(url)).toBe('987654321');
    });

    test('should extract shared token from shared link URL', () => {
      const url = 'https://app.box.com/s/abc123def456';
      expect(URLParser.extractFileId(url)).toBe('shared:abc123def456');
    });

    test('should accept file ID directly', () => {
      const fileId = '123456789';
      expect(URLParser.extractFileId(fileId)).toBe('123456789');
    });

    test('should throw error for invalid URL', () => {
      const url = 'https://example.com/file/123';
      expect(() => URLParser.extractFileId(url)).toThrow('Invalid Box URL format');
    });

    test('should throw error for empty string', () => {
      expect(() => URLParser.extractFileId('')).toThrow('URL cannot be empty');
    });

    test('should throw error for whitespace only', () => {
      expect(() => URLParser.extractFileId('   ')).toThrow('URL cannot be empty');
    });

    test('should handle URLs with trailing slash', () => {
      const url = 'https://app.box.com/file/123456789/';
      expect(URLParser.extractFileId(url)).toBe('123456789');
    });

    test('should handle URLs with query parameters', () => {
      const url = 'https://app.box.com/file/123456789?param=value';
      expect(URLParser.extractFileId(url)).toBe('123456789');
    });
  });

  describe('validate', () => {
    test('should validate correct Box URL', () => {
      const url = 'https://app.box.com/file/123456789';
      expect(URLParser.validate(url)).toBe(true);
    });

    test('should validate correct file ID', () => {
      expect(URLParser.validate('123456789')).toBe(true);
    });

    test('should validate correct shared link', () => {
      const url = 'https://app.box.com/s/abc123';
      expect(URLParser.validate(url)).toBe(true);
    });

    test('should invalidate incorrect URL', () => {
      const url = 'https://example.com/file/123';
      expect(URLParser.validate(url)).toBe(false);
    });

    test('should invalidate empty string', () => {
      expect(URLParser.validate('')).toBe(false);
    });
  });

  describe('isSharedLink', () => {
    test('should return true for shared link ID', () => {
      expect(URLParser.isSharedLink('shared:abc123')).toBe(true);
    });

    test('should return false for regular file ID', () => {
      expect(URLParser.isSharedLink('123456789')).toBe(false);
    });
  });

  describe('getSharedToken', () => {
    test('should extract shared token from shared link ID', () => {
      expect(URLParser.getSharedToken('shared:abc123def')).toBe('abc123def');
    });

    test('should throw error for non-shared link ID', () => {
      expect(() => URLParser.getSharedToken('123456789')).toThrow('Not a shared link ID');
    });
  });
});

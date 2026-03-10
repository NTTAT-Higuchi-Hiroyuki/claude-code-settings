import { ErrorHandler } from '../../src/errorHandler';

describe('ErrorHandler', () => {
  describe('handle', () => {
    test('should handle 401 authentication error', () => {
      const error = { statusCode: 401 };
      const result = ErrorHandler.handle(error);

      expect(result.success).toBe(false);
      expect(result.message).toBe('認証エラー');
      expect(result.error).toContain('BOX_ACCESS_TOKEN');
    });

    test('should handle 403 access denied error', () => {
      const error = { statusCode: 403 };
      const result = ErrorHandler.handle(error);

      expect(result.success).toBe(false);
      expect(result.message).toBe('アクセス拒否');
      expect(result.error).toContain('権限');
    });

    test('should handle 404 file not found error', () => {
      const error = { statusCode: 404 };
      const result = ErrorHandler.handle(error);

      expect(result.success).toBe(false);
      expect(result.message).toBe('ファイルが見つかりません');
      expect(result.error).toContain('存在しない');
    });

    test('should handle 429 rate limit error', () => {
      const error = { statusCode: 429 };
      const result = ErrorHandler.handle(error);

      expect(result.success).toBe(false);
      expect(result.message).toBe('レート制限エラー');
      expect(result.error).toContain('レート制限');
    });

    test('should handle 500 server error', () => {
      const error = { statusCode: 500 };
      const result = ErrorHandler.handle(error);

      expect(result.success).toBe(false);
      expect(result.message).toBe('サーバーエラー');
      expect(result.error).toContain('サーバー');
    });

    test('should handle error with response.statusCode', () => {
      const error = { response: { statusCode: 401 } };
      const result = ErrorHandler.handle(error);

      expect(result.success).toBe(false);
      expect(result.message).toBe('認証エラー');
    });

    test('should handle ECONNREFUSED network error', () => {
      const error = { code: 'ECONNREFUSED' };
      const result = ErrorHandler.handle(error);

      expect(result.success).toBe(false);
      expect(result.message).toBe('ネットワークエラー');
      expect(result.error).toContain('接続できませんでした');
    });

    test('should handle ENOTFOUND network error', () => {
      const error = { code: 'ENOTFOUND' };
      const result = ErrorHandler.handle(error);

      expect(result.success).toBe(false);
      expect(result.message).toBe('ネットワークエラー');
      expect(result.error).toContain('見つかりませんでした');
    });

    test('should handle timeout error', () => {
      const error = { message: 'Request timeout after 30000ms' };
      const result = ErrorHandler.handle(error);

      expect(result.success).toBe(false);
      expect(result.message).toBe('タイムアウトエラー');
      expect(result.error).toContain('タイムアウト');
    });

    test('should handle generic error with message', () => {
      const error = { message: 'Something went wrong' };
      const result = ErrorHandler.handle(error);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Something went wrong');
    });

    test('should handle error without message', () => {
      const error = {};
      const result = ErrorHandler.handle(error);

      expect(result.success).toBe(false);
      expect(result.error).toBe('不明なエラー');
    });
  });

  describe('validationError', () => {
    test('should create validation error result', () => {
      const result = ErrorHandler.validationError('Invalid input');

      expect(result.success).toBe(false);
      expect(result.message).toBe('入力検証エラー');
      expect(result.error).toBe('Invalid input');
    });
  });
});

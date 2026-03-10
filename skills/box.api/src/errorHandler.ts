import { BoxOperationResult } from './types';

/**
 * ErrorHandler - Handle and format errors
 */
export class ErrorHandler {
  /**
   * Handle various error types and return formatted result
   * @param error Error object
   * @returns Formatted error result
   */
  static handle(error: any): BoxOperationResult {
    // Box API errors with status codes
    if (error.statusCode || error.response?.statusCode) {
      const statusCode = error.statusCode || error.response.statusCode;
      return this.handleHTTPError(statusCode, error);
    }

    // Network errors
    if (error.code) {
      return this.handleNetworkError(error.code);
    }

    // Timeout errors
    if (error.message && error.message.includes('timeout')) {
      return {
        success: false,
        message: 'タイムアウトエラー',
        error: 'リクエストがタイムアウトしました。BOX_TIMEOUT環境変数を増やしてください。'
      };
    }

    // Generic errors
    return {
      success: false,
      message: 'エラーが発生しました',
      error: error.message || '不明なエラー'
    };
  }

  /**
   * Handle HTTP status code errors
   */
  private static handleHTTPError(statusCode: number, error: any): BoxOperationResult {
    switch (statusCode) {
      case 401:
        return {
          success: false,
          message: '認証エラー',
          error: 'BOX_ACCESS_TOKEN環境変数を確認してください。トークンが無効または期限切れの可能性があります。'
        };

      case 403:
        return {
          success: false,
          message: 'アクセス拒否',
          error: 'ファイルへのアクセス権限がありません。Box上での権限設定を確認してください。'
        };

      case 404:
        return {
          success: false,
          message: 'ファイルが見つかりません',
          error: '指定されたファイルが存在しないか、URLが正しくありません。'
        };

      case 429:
        return {
          success: false,
          message: 'レート制限エラー',
          error: 'Box APIのレート制限に達しました。しばらく待ってから再試行してください。'
        };

      case 500:
      case 502:
      case 503:
      case 504:
        return {
          success: false,
          message: 'サーバーエラー',
          error: 'Box APIサーバーでエラーが発生しています。しばらく待ってから再試行してください。'
        };

      default:
        return {
          success: false,
          message: `HTTPエラー (${statusCode})`,
          error: error.message || `Box APIがステータスコード${statusCode}を返しました。`
        };
    }
  }

  /**
   * Handle network errors
   */
  private static handleNetworkError(code: string): BoxOperationResult {
    const errorMessages: Record<string, string> = {
      'ECONNREFUSED': 'Box APIサーバーに接続できませんでした。ネットワーク接続を確認してください。',
      'ENOTFOUND': 'Box APIサーバーが見つかりませんでした。DNS設定を確認してください。',
      'ETIMEDOUT': 'Box APIサーバーへの接続がタイムアウトしました。',
      'ECONNRESET': 'Box APIサーバーとの接続が切断されました。'
    };

    return {
      success: false,
      message: 'ネットワークエラー',
      error: errorMessages[code] || `ネットワークエラーが発生しました (${code})`
    };
  }

  /**
   * Create a validation error result
   */
  static validationError(message: string): BoxOperationResult {
    return {
      success: false,
      message: '入力検証エラー',
      error: message
    };
  }
}

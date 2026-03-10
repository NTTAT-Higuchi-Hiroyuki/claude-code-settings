/**
 * InputValidator - Validate user inputs
 */
export class InputValidator {
  private static readonly BOX_URL_PATTERN = /^https:\/\/(app\.)?box\.com\/(file|s)\/\w+/;
  private static readonly FILE_ID_PATTERN = /^\d+$/;
  private static readonly MAX_FILE_SIZE_MB = 50;

  /**
   * Validate Box URL format
   * @param url URL to validate
   * @returns True if valid
   */
  static validateURL(url: string): boolean {
    if (!url || typeof url !== 'string') {
      return false;
    }
    return this.BOX_URL_PATTERN.test(url.trim());
  }

  /**
   * Validate file ID format
   * @param fileId File ID to validate
   * @returns True if valid
   */
  static validateFileId(fileId: string): boolean {
    if (!fileId || typeof fileId !== 'string') {
      return false;
    }
    return this.FILE_ID_PATTERN.test(fileId.trim());
  }

  /**
   * Validate content size (max 50MB)
   * @param content Content to validate
   * @returns True if size is acceptable
   */
  static validateContentSize(content: string): boolean {
    if (!content) {
      return true; // Empty content is valid
    }
    const sizeInBytes = Buffer.byteLength(content, 'utf8');
    const sizeInMB = sizeInBytes / (1024 * 1024);
    return sizeInMB <= this.MAX_FILE_SIZE_MB;
  }

  /**
   * Validate action type
   * @param action Action to validate
   * @returns True if valid
   */
  static validateAction(action: string): action is 'read' | 'update' | 'info' {
    return ['read', 'update', 'info'].includes(action);
  }

  /**
   * Get content size in MB
   * @param content Content to measure
   * @returns Size in MB
   */
  static getContentSizeMB(content: string): number {
    const sizeInBytes = Buffer.byteLength(content, 'utf8');
    return sizeInBytes / (1024 * 1024);
  }
}

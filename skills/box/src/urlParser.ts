/**
 * URLParser - Parse Box URLs and extract file IDs
 */
export class URLParser {
  private static readonly BOX_FILE_URL_PATTERN = /^https:\/\/(?:[\w-]+\.)*box\.com\/file\/(\d+)/;
  private static readonly BOX_SHARED_URL_PATTERN = /^https:\/\/(?:[\w-]+\.)*box\.com\/s\/([a-zA-Z0-9_-]+)/;
  private static readonly FILE_ID_PATTERN = /^\d+$/;

  /**
   * Extract file ID from Box URL
   * @param url Box URL or file ID
   * @returns File ID
   * @throws Error if URL is invalid
   */
  static extractFileId(url: string): string {
    if (!url || url.trim() === '') {
      throw new Error('URL cannot be empty');
    }

    const trimmedUrl = url.trim();

    // Check if it's already a file ID
    if (this.FILE_ID_PATTERN.test(trimmedUrl)) {
      return trimmedUrl;
    }

    // Try to match standard Box file URL
    const fileMatch = trimmedUrl.match(this.BOX_FILE_URL_PATTERN);
    if (fileMatch && fileMatch[1]) {
      return fileMatch[1];
    }

    // Try to match Box shared link URL
    const sharedMatch = trimmedUrl.match(this.BOX_SHARED_URL_PATTERN);
    if (sharedMatch && sharedMatch[1]) {
      // For shared links, we return the share token
      // It will be handled differently in the API client
      return `shared:${sharedMatch[1]}`;
    }

    throw new Error('Invalid Box URL format. Expected: https://app.box.com/file/[id] or https://app.box.com/s/[token]');
  }

  /**
   * Validate Box URL format
   * @param url URL to validate
   * @returns True if valid
   */
  static validate(url: string): boolean {
    try {
      this.extractFileId(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if the ID is a shared link token
   * @param fileId File ID or shared token
   * @returns True if it's a shared link token
   */
  static isSharedLink(fileId: string): boolean {
    return fileId.startsWith('shared:');
  }

  /**
   * Extract shared link token from the ID
   * @param fileId Shared link ID
   * @returns Shared link token
   */
  static getSharedToken(fileId: string): string {
    if (this.isSharedLink(fileId)) {
      return fileId.substring(7); // Remove 'shared:' prefix
    }
    throw new Error('Not a shared link ID');
  }
}

import { BoxAPIClient } from './boxApiClient';
import { URLParser } from './urlParser';
import { InputValidator } from './inputValidator';
import { ErrorHandler } from './errorHandler';
import { BoxSkillOptions, BoxOperationResult, BoxFileInfo } from './types';

/**
 * BoxSkillHandler - Main handler for Box skill operations
 */
export class BoxSkillHandler {
  private apiClient: BoxAPIClient;

  constructor(accessToken: string, timeout?: number) {
    this.apiClient = new BoxAPIClient({ accessToken, timeout });
  }

  /**
   * Execute Box skill operation
   * @param options Operation options
   * @returns Operation result
   */
  async execute(options: BoxSkillOptions): Promise<BoxOperationResult> {
    try {
      // Validate URL
      if (!URLParser.validate(options.url)) {
        return ErrorHandler.validationError('無効なBox URL形式です。');
      }

      // Validate action
      if (!InputValidator.validateAction(options.action)) {
        return ErrorHandler.validationError('無効なアクションです。read, update, info のいずれかを指定してください。');
      }

      // Extract file ID
      const fileId = URLParser.extractFileId(options.url);

      // Route to appropriate handler
      switch (options.action) {
        case 'read':
          return await this.handleRead(fileId);
        case 'update':
          if (!options.content) {
            return ErrorHandler.validationError('update アクションにはcontentパラメータが必要です。');
          }
          return await this.handleUpdate(fileId, options.content);
        case 'info':
          return await this.handleInfo(fileId);
        default:
          return ErrorHandler.validationError('未知のアクションです。');
      }
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }

  /**
   * Handle read operation
   * @param fileId File ID or shared token
   * @returns Operation result with file content
   */
  private async handleRead(fileId: string): Promise<BoxOperationResult> {
    try {
      let content: string;
      let fileInfo: BoxFileInfo;

      if (URLParser.isSharedLink(fileId)) {
        // Handle shared link
        const sharedToken = URLParser.getSharedToken(fileId);
        const sharedUrl = `https://app.box.com/s/${sharedToken}`;
        content = await this.apiClient.getSharedLinkContent(sharedUrl);
        fileInfo = await this.apiClient.getSharedLinkFile(sharedUrl);
      } else {
        // Handle direct file ID
        content = await this.apiClient.getFileContent(fileId);
        fileInfo = await this.apiClient.getFileInfo(fileId);
      }

      return {
        success: true,
        message: `ファイル "${fileInfo.name}" を読み取りました`,
        data: {
          content,
          fileInfo
        }
      };
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }

  /**
   * Handle update operation
   * @param fileId File ID
   * @param content New content
   * @returns Operation result
   */
  private async handleUpdate(fileId: string, content: string): Promise<BoxOperationResult> {
    try {
      // Check if it's a shared link (cannot update via shared link)
      if (URLParser.isSharedLink(fileId)) {
        return ErrorHandler.validationError('共有リンク経由でのファイル更新はサポートされていません。直接のファイルURLを使用してください。');
      }

      // Validate content size
      if (!InputValidator.validateContentSize(content)) {
        const sizeMB = InputValidator.getContentSizeMB(content);
        return ErrorHandler.validationError(`ファイルサイズが大きすぎます (${sizeMB.toFixed(2)}MB)。最大50MBまでサポートしています。`);
      }

      // Update file
      const updatedFile = await this.apiClient.updateFile(fileId, content);

      return {
        success: true,
        message: `ファイル "${updatedFile.name}" を更新しました`,
        data: {
          fileInfo: updatedFile
        }
      };
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }

  /**
   * Handle info operation
   * @param fileId File ID or shared token
   * @returns Operation result with file info
   */
  private async handleInfo(fileId: string): Promise<BoxOperationResult> {
    try {
      let fileInfo: BoxFileInfo;

      if (URLParser.isSharedLink(fileId)) {
        const sharedToken = URLParser.getSharedToken(fileId);
        const sharedUrl = `https://app.box.com/s/${sharedToken}`;
        fileInfo = await this.apiClient.getSharedLinkFile(sharedUrl);
      } else {
        fileInfo = await this.apiClient.getFileInfo(fileId);
      }

      const sizeKB = (fileInfo.size / 1024).toFixed(2);
      const sizeMB = (fileInfo.size / (1024 * 1024)).toFixed(2);
      const displaySize = fileInfo.size > 1024 * 1024 ? `${sizeMB} MB` : `${sizeKB} KB`;

      const infoMessage = `
📄 ファイル情報:
  名前: ${fileInfo.name}
  ID: ${fileInfo.id}
  サイズ: ${displaySize}
  作成日時: ${new Date(fileInfo.created_at).toLocaleString('ja-JP')}
  更新日時: ${new Date(fileInfo.modified_at).toLocaleString('ja-JP')}
  パス: ${fileInfo.path}
      `.trim();

      return {
        success: true,
        message: infoMessage,
        data: fileInfo
      };
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }
}

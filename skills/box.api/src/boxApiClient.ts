import BoxSDK from 'box-node-sdk';
import { Readable } from 'stream';
import { BoxFileInfo, BoxAPIConfig } from './types';

/**
 * BoxAPIClient - Interface with Box API
 */
export class BoxAPIClient {
  private client: any;
  private timeout: number;

  constructor(config: BoxAPIConfig) {
    const sdk = new BoxSDK({
      clientID: 'not-required-for-developer-token',
      clientSecret: 'not-required-for-developer-token'
    });

    this.client = sdk.getBasicClient(config.accessToken);
    this.timeout = config.timeout || 30000; // Default 30 seconds
  }

  /**
   * Get file information
   * @param fileId Box file ID
   * @returns File information
   */
  async getFileInfo(fileId: string): Promise<BoxFileInfo> {
    try {
      const file = await this.client.files.get(fileId);

      return {
        id: file.id,
        name: file.name,
        size: file.size,
        modified_at: file.modified_at,
        created_at: file.created_at,
        path: file.path_collection?.entries?.map((e: any) => e.name).join('/') || '/'
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get file content
   * @param fileId Box file ID
   * @returns File content as string
   */
  async getFileContent(fileId: string): Promise<string> {
    try {
      const stream = await this.client.files.getReadStream(fileId);
      return await this.streamToString(stream);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update file content
   * @param fileId Box file ID
   * @param content New content
   * @returns Updated file information
   */
  async updateFile(fileId: string, content: string): Promise<BoxFileInfo> {
    try {
      // Convert string to stream
      const stream = Readable.from([content]);

      // Upload new version
      const file = await this.client.files.uploadNewFileVersion(
        fileId,
        stream,
        {
          content_modified_at: new Date().toISOString()
        }
      );

      return {
        id: file.id,
        name: file.name,
        size: file.size,
        modified_at: file.modified_at,
        created_at: file.created_at,
        path: file.path_collection?.entries?.map((e: any) => e.name).join('/') || '/'
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get file from shared link
   * @param sharedLink Shared link URL
   * @returns File information
   */
  async getSharedLinkFile(sharedLink: string): Promise<BoxFileInfo> {
    try {
      const file = await this.client.sharedItems.get(sharedLink);

      return {
        id: file.id,
        name: file.name,
        size: file.size,
        modified_at: file.modified_at,
        created_at: file.created_at,
        path: file.path_collection?.entries?.map((e: any) => e.name).join('/') || '/'
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get file content from shared link
   * @param sharedLink Shared link URL
   * @returns File content as string
   */
  async getSharedLinkContent(sharedLink: string): Promise<string> {
    try {
      // First get file info to get the file ID
      const fileInfo = await this.getSharedLinkFile(sharedLink);
      // Then download the content using the file ID
      return await this.getFileContent(fileInfo.id);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Convert stream to string
   * @param stream Readable stream
   * @returns String content
   */
  private async streamToString(stream: Readable): Promise<string> {
    const chunks: Buffer[] = [];

    return new Promise((resolve, reject) => {
      stream.on('data', (chunk: Buffer) => chunks.push(chunk));
      stream.on('error', reject);
      stream.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve(buffer.toString('utf8'));
      });

      // Set timeout
      setTimeout(() => {
        stream.destroy();
        reject(new Error('Stream read timeout'));
      }, this.timeout);
    });
  }
}

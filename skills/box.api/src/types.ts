/**
 * Box file metadata information
 */
export interface BoxFileInfo {
  id: string;
  name: string;
  size: number;
  modified_at: string;
  created_at: string;
  path: string;
}

/**
 * Box skill operation options
 */
export interface BoxSkillOptions {
  url: string;
  action: 'read' | 'update' | 'info';
  content?: string;
}

/**
 * Box operation result
 */
export interface BoxOperationResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

/**
 * Box API client configuration
 */
export interface BoxAPIConfig {
  accessToken: string;
  timeout?: number;
}

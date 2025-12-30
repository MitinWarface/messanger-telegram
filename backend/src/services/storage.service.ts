import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface FileUploadResult {
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  path: string;
  url: string;
}

export class StorageService {
  private readonly uploadsPath: string;
  private readonly maxFileSize: number;
  private readonly allowedTypes: string[];

  constructor() {
    this.uploadsPath = process.env.UPLOADS_PATH || path.join(process.cwd(), 'uploads');
    this.maxFileSize = parseInt(process.env.MAX_FILE_SIZE || '104857600'); // 100MB default
    this.allowedTypes = (process.env.ALLOWED_TYPES || 'image/*,video/*,application/pdf').split(',');
    
    // Create uploads directory if it doesn't exist
    this.ensureUploadsDirectory();
  }

  private ensureUploadsDirectory() {
    if (!fs.existsSync(this.uploadsPath)) {
      fs.mkdirSync(this.uploadsPath, { recursive: true });
    }
    
    // Create subdirectories
    const subdirs = ['avatars', 'media', 'documents', 'temp'];
    for (const subdir of subdirs) {
      const dirPath = path.join(this.uploadsPath, subdir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    }
 }

  async uploadFile(
    fileBuffer: Buffer, 
    originalName: string, 
    mimeType: string,
    category: 'avatar' | 'media' | 'document' = 'media'
  ): Promise<FileUploadResult> {
    // Validate file size
    if (fileBuffer.length > this.maxFileSize) {
      throw new Error(`File size exceeds limit of ${this.maxFileSize} bytes`);
    }

    // Validate file type
    if (!this.isAllowedType(mimeType)) {
      throw new Error(`File type ${mimeType} is not allowed`);
    }

    // Generate unique filename
    const fileExtension = this.getFileExtension(originalName, mimeType);
    const filename = `${Date.now()}_${uuidv4()}${fileExtension}`;
    
    // Determine category subdirectory
    let subdir: string;
    switch (category) {
      case 'avatar':
        subdir = 'avatars';
        break;
      case 'document':
        subdir = 'documents';
        break;
      default:
        subdir = 'media';
    }
    
    const filePath = path.join(this.uploadsPath, subdir, filename);
    const relativePath = path.join(subdir, filename);
    
    // Write file to disk
    await fs.promises.writeFile(filePath, fileBuffer);
    
    return {
      filename,
      originalName,
      size: fileBuffer.length,
      mimeType,
      path: filePath,
      url: `/api/uploads/${relativePath}`
    };
  }

  private isAllowedType(mimeType: string): boolean {
    for (const allowedType of this.allowedTypes) {
      const trimmedType = allowedType.trim();
      
      if (trimmedType.endsWith('/*')) {
        // Wildcard type like 'image/*'
        const baseType = trimmedType.slice(0, -2);
        if (mimeType.startsWith(baseType)) {
          return true;
        }
      } else if (trimmedType === mimeType) {
        return true;
      }
    }
    return false;
  }

  private getFileExtension(originalName: string, mimeType: string): string {
    // Try to get extension from original name first
    const nameExt = path.extname(originalName);
    if (nameExt) {
      return nameExt.toLowerCase();
    }
    
    // Fallback to mapping based on mime type
    const extensionMap: { [key: string]: string } = {
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp',
      'video/mp4': '.mp4',
      'video/quicktime': '.mov',
      'video/x-msvideo': '.avi',
      'video/x-matroska': '.mkv',
      'application/pdf': '.pdf',
      'application/msword': '.doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
      'application/vnd.ms-excel': '.xls',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
      'text/plain': '.txt',
      'application/zip': '.zip',
      'application/x-rar-compressed': '.rar'
    };
    
    return extensionMap[mimeType] || '';
  }

  async deleteFile(filePath: string): Promise<boolean> {
    try {
      await fs.promises.unlink(filePath);
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

 async getFile(filePath: string): Promise<Buffer | null> {
    try {
      return await fs.promises.readFile(filePath);
    } catch (error) {
      console.error('Error reading file:', error);
      return null;
    }
  }

 async getFileStats(filePath: string): Promise<fs.Stats | null> {
    try {
      return await fs.promises.stat(filePath);
    } catch (error) {
      console.error('Error getting file stats:', error);
      return null;
    }
  }
}
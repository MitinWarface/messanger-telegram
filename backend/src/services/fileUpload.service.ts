import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { StorageService } from './storage.service.js';

interface FileUploadRequest extends Request {
  file?: Express.Multer.File;
  files?: Express.Multer.File[];
}

export class FileUploadService {
  private storageService: StorageService;
  private upload: multer.Multer;

  constructor() {
    this.storageService = new StorageService();
    
    // Configure multer storage
    const multerStorage = multer.diskStorage({
      destination: (req, file, cb) => {
        // Create temporary directory if it doesn't exist
        const tempDir = path.join(process.cwd(), 'temp');
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true });
        }
        cb(null, tempDir);
      },
      filename: (req, file, cb) => {
        // Generate unique filename
        const uniqueName = `${Date.now()}_${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
      }
    });

    // File filter to allow only certain file types
    const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
      // Get allowed types from environment or use defaults
      const allowedTypes = (process.env.ALLOWED_TYPES || 'image/*,video/*,application/pdf').split(',');
      
      // Check if file type is allowed
      let isAllowed = false;
      for (const allowedType of allowedTypes) {
        const trimmedType = allowedType.trim();
        
        if (trimmedType.endsWith('/*')) {
          // Wildcard type like 'image/*'
          const baseType = trimmedType.slice(0, -2);
          if (file.mimetype.startsWith(baseType)) {
            isAllowed = true;
            break;
          }
        } else if (trimmedType === file.mimetype) {
          isAllowed = true;
          break;
        }
      }
      
      if (isAllowed) {
        cb(null, true);
      } else {
        cb(new Error(`File type ${file.mimetype} is not allowed`));
      }
    };

    // Initialize multer
    this.upload = multer({
      storage: multerStorage,
      fileFilter: fileFilter,
      limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE || '104857600'), // 100MB default
        files: 10 // Maximum number of files allowed per request
      }
    });
  }

  // Middleware for single file upload
  singleUpload = (req: FileUploadRequest, res: Response, next: NextFunction) => {
    this.upload.single('file')(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large' });
          }
          if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({ error: 'Too many files' });
          }
        }
        return res.status(400).json({ error: err.message });
      }
      next();
    });
 };

  // Middleware for multiple file upload
  multiUpload = (req: FileUploadRequest, res: Response, next: NextFunction) => {
    this.upload.array('files')(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large' });
          }
          if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({ error: 'Too many files' });
          }
        }
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  };

  // Upload file to storage
  async uploadFile(req: FileUploadRequest, category: 'avatar' | 'media' | 'document' = 'media') {
    if (!req.file) {
      throw new Error('No file uploaded');
    }

    // Read file buffer
    const fileBuffer = await fs.promises.readFile(req.file.path);
    
    // Upload to storage service
    const result = await this.storageService.uploadFile(
      fileBuffer,
      req.file.originalname,
      req.file.mimetype,
      category
    );

    // Clean up temporary file
    await fs.promises.unlink(req.file.path);

    return result;
  }

  // Upload multiple files
  async uploadFiles(req: FileUploadRequest, category: 'avatar' | 'media' | 'document' = 'media') {
    if (!req.files || !Array.isArray(req.files)) {
      throw new Error('No files uploaded');
    }

    const results = [];
    
    for (const file of req.files) {
      // Read file buffer
      const fileBuffer = await fs.promises.readFile(file.path);
      
      // Upload to storage service
      const result = await this.storageService.uploadFile(
        fileBuffer,
        file.originalname,
        file.mimetype,
        category
      );
      
      // Clean up temporary file
      await fs.promises.unlink(file.path);
      
      results.push(result);
    }

    return results;
  }
}
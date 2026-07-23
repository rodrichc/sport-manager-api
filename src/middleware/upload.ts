import multer from 'multer';
import { cloudinaryStorage } from '../services/storage/CloudinaryStorageService';

export const uploadImageMiddleware = multer({
  storage: cloudinaryStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido. Solo se aceptan imágenes (JPEG, PNG, WEBP)'));
    }
  }
});
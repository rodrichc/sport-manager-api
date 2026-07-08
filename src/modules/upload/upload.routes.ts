import { Router } from 'express';
import multer from 'multer';
import { cloudinaryStorage } from '../../services/storage/CloudinaryStorageService';
import { uploadController } from './upload.controller';

const router = Router();

const upload = multer({
  storage: cloudinaryStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

router.post('/', upload.single('image'), uploadController.uploadImage);

export default router;

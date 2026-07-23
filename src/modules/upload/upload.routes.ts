import { Router } from 'express';
import { uploadController } from './upload.controller';
import { authenticate } from '../../middleware/authenticate';
import { uploadImageMiddleware } from '../../middleware/upload';

const router = Router();


router.post('/', authenticate, uploadImageMiddleware.single('image'), uploadController.uploadImage);

export default router;

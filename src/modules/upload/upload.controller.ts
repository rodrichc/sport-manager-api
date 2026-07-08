import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';

export class UploadController {
  uploadImage = catchAsync(async (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded or invalid file format' });
    }
    
    res.json({
      message: 'File uploaded successfully',
      url: req.file.path
    });
  });
}

export const uploadController = new UploadController();

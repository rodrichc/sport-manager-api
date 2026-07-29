import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { CloudinaryStorageService } from '../../services/storage/CloudinaryStorageService';

const storageService = new CloudinaryStorageService()

export class UploadController {
  uploadImage = catchAsync(async (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ message: 'No se subió ningún archivo o el formato no es válido' });
    }

    const folder = (req.query.folder as string) || '';
    const fileName = `${Date.now()}-${req.file.originalname.split('.')[0]}`;

    const imageUrl = await storageService.uploadFile(
      req.file.buffer,
      fileName,
      folder
    );

    return res.status(200).json({
      message: 'Archivo subido correctamente',
      url: imageUrl
    });
  });
}

export const uploadController = new UploadController();
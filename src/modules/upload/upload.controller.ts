import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';

export class UploadController {
  uploadImage = catchAsync(async (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ message: 'No se subió ningún archivo o el formato no es válido' });
    }

    return res.status(200).json({
      message: 'Archivo subido correctamente',
      url: req.file.path
    });
  });
}

export const uploadController = new UploadController();
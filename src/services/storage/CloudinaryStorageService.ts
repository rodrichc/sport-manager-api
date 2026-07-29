import { v2 as cloudinary } from 'cloudinary';
import { IStorageService } from './IStorageService';
import { env } from '../../config/env';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export class CloudinaryStorageService implements IStorageService {
  async uploadFile(fileBuffer: Buffer, fileName: string, subfolder: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: subfolder ? `sport-manager/${subfolder}` : 'sport-manager', public_id: fileName },
        (error, result) => {
          if (error) return reject(error);
          if (result) return resolve(result.secure_url);
        }
      );
      uploadStream.end(fileBuffer);
    });
  }

  async deleteFile(fileUrl: string): Promise<void> {
    const indexExtension = fileUrl.lastIndexOf('.')
    const cleanUrl = fileUrl.slice(0, indexExtension)
    const params = cleanUrl.split('/');
    const index = params.indexOf('sport-manager')
    const publicId = params.slice(index).join('/')

    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
    }
  }
}

export interface IStorageService {
  uploadFile(fileBuffer: Buffer, fileName: string, subfolder: string): Promise<string>;
  deleteFile(fileUrl: string): Promise<void>;
}

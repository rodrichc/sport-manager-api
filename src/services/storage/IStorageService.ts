export interface IStorageService {
  uploadFile(fileBuffer: Buffer, fileName: string): Promise<string>;
  deleteFile(fileUrl: string): Promise<void>;
}

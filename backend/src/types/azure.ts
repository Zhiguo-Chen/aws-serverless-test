// Azure 存储相关类型定义
import { ImageUploadResult } from '../services/imageService';

export type UploadResult = ImageUploadResult;

export interface ImageMeta {
  name: string;
  isPrimary: boolean;
}

export interface ProductImageData {
  imageUrl: string;
  originalName: string;
  isPrimary: boolean;
  sortOrder: number;
}

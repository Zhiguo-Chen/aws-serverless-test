import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// 将上传目录移到项目外部
const uploadDir =
  process.env.UPLOAD_DIR || path.join(process.cwd(), '../uploads');

// 确保上传目录存在
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 创建按日期分组的子目录
const createDateFolder = () => {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const dateFolder = path.join(uploadDir, today);
  if (!fs.existsSync(dateFolder)) {
    fs.mkdirSync(dateFolder, { recursive: true });
  }
  return dateFolder;
};

// 本地存储配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dateFolder = createDateFolder();
    cb(null, dateFolder);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

export const localUpload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB限制
  },
});

// 删除本地文件
export const deleteLocalFile = async (filePath: string): Promise<boolean> => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('删除本地文件失败:', error);
    return false;
  }
};

// 清理旧文件（可以设置定时任务）
export const cleanupOldFiles = (daysOld: number = 30) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  // 实现清理逻辑
  // 这里可以添加定时清理旧文件的逻辑
};

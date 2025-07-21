import AWS from 'aws-sdk';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { v4 as uuidv4 } from 'uuid';

// AWS S3 配置
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1',
});

// S3 上传配置
export const s3Upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET || 'your-bucket-name',
    acl: 'public-read',
    key: function (req, file, cb) {
      const fileName = `products/${Date.now()}-${uuidv4()}-${
        file.originalname
      }`;
      cb(null, fileName);
    },
    contentType: multerS3.AUTO_CONTENT_TYPE,
  }),
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

// 删除S3文件
export const deleteS3File = async (fileUrl: string): Promise<boolean> => {
  try {
    const key = fileUrl.split('/').slice(-2).join('/'); // 提取key
    await s3
      .deleteObject({
        Bucket: process.env.AWS_S3_BUCKET || 'your-bucket-name',
        Key: key,
      })
      .promise();
    return true;
  } catch (error) {
    console.error('删除S3文件失败:', error);
    return false;
  }
};

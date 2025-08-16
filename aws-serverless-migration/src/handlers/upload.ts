import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { S3 } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import * as multipart from 'lambda-multipart-parser';
import { successResponse, errorResponse } from '../utils/response';

const s3 = new S3();

// Allowed file types for security
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const uploadImage = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    const contentType =
      event.headers['content-type'] || event.headers['Content-Type'];

    if (!contentType) {
      return errorResponse('Content-Type header is required', 400);
    }

    let fileBuffer: Buffer;
    let fileName: string;
    let mimeType: string;

    if (contentType.includes('multipart/form-data')) {
      // Handle multipart form data
      const result = await multipart.parse(event);

      if (!result.files || result.files.length === 0) {
        return errorResponse('No file provided', 400);
      }

      const file = result.files[0];
      fileBuffer = file.content;
      fileName = file.filename;
      mimeType = file.contentType;
    } else if (contentType.includes('application/json')) {
      // Handle JSON with base64 encoded file
      const body = JSON.parse(event.body || '{}');
      const { fileName: fn, fileData, mimeType: mt } = body;

      if (!fn || !fileData || !mt) {
        return errorResponse(
          'fileName, fileData, and mimeType are required',
          400,
        );
      }

      fileName = fn;
      mimeType = mt;
      fileBuffer = Buffer.from(fileData, 'base64');
    } else {
      return errorResponse('Unsupported content type', 400);
    }

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return errorResponse(
        'File type not allowed. Only images are supported.',
        400,
      );
    }

    // Validate file size
    if (fileBuffer.length > MAX_FILE_SIZE) {
      return errorResponse('File size exceeds 5MB limit', 400);
    }

    // Generate unique filename
    const fileExtension = fileName.split('.').pop() || 'jpg';
    const uniqueFileName = `${uuidv4()}.${fileExtension}`;
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const key = `uploads/${timestamp}/${uniqueFileName}`;

    const uploadParams: S3.PutObjectRequest = {
      Bucket: process.env.S3_BUCKET!,
      Key: key,
      Body: fileBuffer,
      ContentType: mimeType,
      Metadata: {
        originalName: fileName,
        uploadedAt: new Date().toISOString(),
      },
    };

    const result = await s3.upload(uploadParams).promise();

    return successResponse({
      imageUrl: result.Location,
      fileName: uniqueFileName,
      originalName: fileName,
      size: fileBuffer.length,
      contentType: mimeType,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return errorResponse('Upload failed', 500);
  }
};

export const getSignedUploadUrl = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    const { fileName, contentType } = JSON.parse(event.body || '{}');

    if (!fileName || !contentType) {
      return errorResponse('fileName and contentType are required', 400);
    }

    // Validate content type
    if (!ALLOWED_MIME_TYPES.includes(contentType)) {
      return errorResponse(
        'File type not allowed. Only images are supported.',
        400,
      );
    }

    const fileExtension = fileName.split('.').pop() || 'jpg';
    const uniqueFileName = `${uuidv4()}.${fileExtension}`;
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const key = `uploads/${timestamp}/${uniqueFileName}`;

    const params = {
      Bucket: process.env.S3_BUCKET!,
      Key: key,
      ContentType: contentType,
      Expires: 300, // 5 minutes
    };

    const signedUrl = s3.getSignedUrl('putObject', params);
    const publicUrl = `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${key}`;

    return successResponse({
      signedUrl,
      publicUrl,
      fileName: uniqueFileName,
      key,
    });
  } catch (error) {
    console.error('Signed URL error:', error);
    return errorResponse('Failed to generate signed URL', 500);
  }
};

export const deleteImage = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    const { key } = event.pathParameters || {};

    if (!key) {
      return errorResponse('Image key is required', 400);
    }

    const deleteParams: S3.DeleteObjectRequest = {
      Bucket: process.env.S3_BUCKET!,
      Key: decodeURIComponent(key),
    };

    await s3.deleteObject(deleteParams).promise();

    return successResponse({
      message: 'Image deleted successfully',
      key: decodeURIComponent(key),
    });
  } catch (error) {
    console.error('Delete error:', error);
    return errorResponse('Failed to delete image', 500);
  }
};

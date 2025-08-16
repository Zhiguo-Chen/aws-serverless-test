import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { successResponse } from '../utils/response';

export const check = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  return successResponse({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.STAGE || 'dev',
  });
};

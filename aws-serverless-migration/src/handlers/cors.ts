import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { corsResponse } from '../utils/response';

// 处理 OPTIONS 预检请求
export const corsHandler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  console.log('CORS preflight request:', {
    origin: event.headers.origin || event.headers.Origin,
    method: event.headers['access-control-request-method'],
    headers: event.headers['access-control-request-headers'],
  });

  return corsResponse(event);
};

import { APIGatewayProxyResult } from 'aws-lambda';

// 动态CORS头，支持多个域名
const getAllowedOrigin = (event?: any): string => {
  if (!event?.headers) return '*';

  const origin = event.headers.origin || event.headers.Origin;
  const allowedOrigins = [
    'https://my-demo.camdvr.org',
    'https://icy-sky-08145be00.6.azurestaticapps.net',
    'http://localhost:3001',
    'http://127.0.0.1:3001',
  ];

  return allowedOrigins.includes(origin) ? origin : '*';
};

const getCorsHeaders = (event?: any) => ({
  'Access-Control-Allow-Origin': getAllowedOrigin(event),
  'Access-Control-Allow-Headers':
    'Content-Type,Authorization,X-Amz-Date,X-Api-Key',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400',
});

export const successResponse = (
  data: any,
  statusCode: number = 200,
  event?: any,
): APIGatewayProxyResult => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    ...getCorsHeaders(event),
  },
  body: JSON.stringify(data),
});

export const errorResponse = (
  message: string,
  statusCode: number = 500,
  details?: any,
  event?: any,
): APIGatewayProxyResult => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    ...getCorsHeaders(event),
  },
  body: JSON.stringify({
    error: message,
    ...(details && { details }),
  }),
});

// OPTIONS 预检请求处理
export const corsResponse = (event?: any): APIGatewayProxyResult => ({
  statusCode: 200,
  headers: getCorsHeaders(event),
  body: '',
});

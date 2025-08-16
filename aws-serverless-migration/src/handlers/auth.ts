import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  APIGatewayAuthorizerResult,
} from 'aws-lambda';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';
import { successResponse, errorResponse } from '../utils/response';

// 临时用户数据 (在实际项目中应该连接数据库)
const mockUsers = [
  {
    id: '1',
    email: 'test@example.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    firstName: 'Test',
    lastName: 'User',
  },
  {
    id: '2',
    email: 'admin@example.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    firstName: 'Admin',
    lastName: 'User',
  },
  {
    id: '3',
    email: 'chenzhiguo91@gmail.com',
    password: '$2a$10$NQzAzEXp.rHkl0SGK6XSG.olRe7m66tMvh6eAZKQOtNI9ZXudn566', // welcome321
    firstName: 'Chen',
    lastName: 'Zhiguo',
  },
];

export const login = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    console.log('=== LOGIN ATTEMPT ===');
    console.log('Request body:', event.body);

    const { email, password } = JSON.parse(event.body || '{}');
    console.log('Parsed credentials:', {
      email,
      passwordLength: password?.length,
    });

    if (!email || !password) {
      console.log('Missing email or password');
      return errorResponse('Email and password are required', 400, null, event);
    }

    // 查找用户
    console.log(
      'Available users:',
      mockUsers.map((u) => ({ id: u.id, email: u.email })),
    );
    const user = mockUsers.find((u) => u.email === email);
    console.log('User lookup result:', { email, found: !!user });

    if (!user) {
      console.log('User not found for email:', email);
      return errorResponse('Invalid credentials', 401, null, event);
    }

    // 验证密码
    console.log('Verifying password for user:', user.email);
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('Password validation result:', isValidPassword);

    if (!isValidPassword) {
      console.log('Invalid password for user:', user.email);
      return errorResponse('Invalid credentials', 401, null, event);
    }

    // 生成JWT token
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.email.includes('admin') ? 'admin' : 'user',
    };

    console.log('Generating token with payload:', tokenPayload);
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET!, {
      expiresIn: '24h',
    });

    const response = {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };

    console.log('Login successful, returning response');
    return successResponse(response, 200, event);
  } catch (error) {
    console.error('=== LOGIN ERROR ===');
    console.error('Error details:', error);
    console.error(
      'Error stack:',
      error instanceof Error ? error.stack : 'No stack trace',
    );
    return errorResponse('Login failed', 500, null, event);
  }
};

export const register = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    console.log('=== REGISTRATION ATTEMPT ===');
    console.log('Request body:', event.body);

    const { email, password, firstName, lastName } = JSON.parse(
      event.body || '{}',
    );

    if (!email || !password || !firstName || !lastName) {
      return errorResponse('All fields are required', 400, null, event);
    }

    // 检查用户是否已存在
    const existingUser = mockUsers.find((u) => u.email === email);
    if (existingUser) {
      return errorResponse('User already exists', 409, null, event);
    }

    // 生成密码hash
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建新用户
    const newUser = {
      id: (mockUsers.length + 1).toString(),
      email,
      password: hashedPassword,
      firstName,
      lastName,
    };

    // 临时添加到mock数据中
    mockUsers.push(newUser);

    const token = jwt.sign(
      {
        userId: newUser.id,
        email: newUser.email,
        role: 'user',
      },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' },
    );

    console.log('Registration successful for:', newUser.email);

    return successResponse(
      {
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
        },
      },
      201,
      event,
    );
  } catch (error) {
    console.error('Registration error:', error);
    return errorResponse('Registration failed', 500, null, event);
  }
};

export const authorizer = async (
  event: any,
): Promise<APIGatewayAuthorizerResult> => {
  try {
    console.log('=== AUTHORIZER ===');
    console.log('Authorization token:', event.authorizationToken);

    const token = event.authorizationToken?.replace('Bearer ', '');

    if (!token) {
      console.error('No token provided');
      throw new Error('No token provided');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    console.log('Token decoded successfully:', {
      userId: decoded.userId,
      email: decoded.email,
    });

    const policy = {
      principalId: decoded.userId,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: event.methodArn,
          },
        ],
      },
      context: {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role || 'user',
      },
    };

    console.log('Authorizer returning policy for user:', decoded.userId);
    return policy;
  } catch (error) {
    console.error('Authorization error:', error);
    throw new Error('Unauthorized');
  }
};

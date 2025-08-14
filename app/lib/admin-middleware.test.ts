import { NextRequest } from 'next/server';
import { withAdmin } from './admin-middleware';
import { generateToken } from './jwt';

// モック設定
jest.mock('./prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

// Request オブジェクトのモック
const createMockRequest = (token?: string) => {
  const headers = new Headers();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return new NextRequest('http://localhost:3000/test', { headers });
};

describe('管理者認証ミドルウェア', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('管理者ユーザーのアクセス許可', async () => {
    // 管理者ユーザーのJWTトークン作成
    const adminToken = generateToken({
      userId: 1,
      email: 'admin@example.com',
      name: 'Admin User',
      isAdmin: true
    });

    const mockRequest = createMockRequest(adminToken);
    const mockHandler = jest.fn().mockResolvedValue(new Response('success'));

    const wrappedHandler = withAdmin(mockHandler);
    await wrappedHandler(mockRequest);

    expect(mockHandler).toHaveBeenCalledWith(
      mockRequest, 
      expect.objectContaining({
        userId: 1,
        email: 'admin@example.com',
        name: 'Admin User',
        isAdmin: true
      })
    );
  });

  test('一般ユーザーのアクセス拒否', async () => {
    // 一般ユーザーのJWTトークン作成
    const userToken = generateToken({
      userId: 2,
      email: 'user@example.com',
      name: 'Regular User',
      isAdmin: false
    });

    const mockRequest = createMockRequest(userToken);
    const mockHandler = jest.fn();

    const wrappedHandler = withAdmin(mockHandler);
    const response = await wrappedHandler(mockRequest) as Response;

    expect(mockHandler).not.toHaveBeenCalled();
    expect(response.status).toBe(403);
    
    const responseData = await response.json();
    expect(responseData).toEqual({
      error: 'この操作には管理者権限が必要です'
    });
  });

  test('未認証ユーザーのアクセス拒否', async () => {
    const mockRequest = createMockRequest(); // トークンなし
    const mockHandler = jest.fn();

    const wrappedHandler = withAdmin(mockHandler);
    const response = await wrappedHandler(mockRequest) as Response;

    expect(mockHandler).not.toHaveBeenCalled();
    expect(response.status).toBe(401);
    
    const responseData = await response.json();
    expect(responseData).toEqual({
      error: '認証が必要です'
    });
  });

  test('無効なトークンでのアクセス拒否', async () => {
    const invalidToken = 'invalid.token.here';
    const mockRequest = createMockRequest(invalidToken);
    const mockHandler = jest.fn();

    const wrappedHandler = withAdmin(mockHandler);
    const response = await wrappedHandler(mockRequest) as Response;

    expect(mockHandler).not.toHaveBeenCalled();
    expect(response.status).toBe(401);
    
    const responseData = await response.json();
    expect(responseData).toEqual({
      error: '認証トークンが無効です'
    });
  });

  test('isAdminフィールドが未定義の場合のアクセス拒否', async () => {
    // isAdminフィールドがないトークン作成
    const tokenWithoutAdmin = generateToken({
      userId: 3,
      email: 'nonadmin@example.com',
      name: 'Non Admin User'
    });

    const mockRequest = createMockRequest(tokenWithoutAdmin);
    const mockHandler = jest.fn();

    const wrappedHandler = withAdmin(mockHandler);
    const response = await wrappedHandler(mockRequest) as Response;

    expect(mockHandler).not.toHaveBeenCalled();
    expect(response.status).toBe(403);
    
    const responseData = await response.json();
    expect(responseData).toEqual({
      error: 'この操作には管理者権限が必要です'
    });
  });
});
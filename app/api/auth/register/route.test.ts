import { NextRequest } from 'next/server';
import { POST } from './route';
import { generateToken } from '@/app/lib/jwt';
import { hashPassword } from '@/app/lib/password';

// Prismaのモック
jest.mock('@/app/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

// パスワードハッシュ化のモック
jest.mock('@/app/lib/password', () => ({
  hashPassword: jest.fn(),
}));

const { prisma } = require('@/app/lib/prisma');
const mockHashPassword = hashPassword as jest.MockedFunction<typeof hashPassword>;

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHashPassword.mockResolvedValue('hashedpassword123');
  });

  const createMockRequest = (body: any, isAdmin = true) => {
    const adminToken = generateToken({
      userId: 1,
      email: 'admin@example.com',
      name: 'Admin User',
      isAdmin
    });

    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    headers.set('Authorization', `Bearer ${adminToken}`);

    return new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });
  };

  test('管理者による正常なユーザー登録', async () => {
    // メールアドレスの重複チェック: 存在しない
    prisma.user.findUnique.mockResolvedValue(null);
    
    // ユーザー作成の成功
    const createdUser = {
      id: 2,
      email: 'newuser@example.com',
      name: 'New User',
      isAdmin: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    prisma.user.create.mockResolvedValue(createdUser);

    const requestBody = {
      email: 'newuser@example.com',
      name: 'New User',
      password: 'SecurePass123!'
    };

    const request = createMockRequest(requestBody);
    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(201);
    expect(responseData).toEqual({
      success: true,
      message: 'ユーザーが正常に作成されました',
      user: {
        id: 2,
        email: 'newuser@example.com',
        name: 'New User',
        isAdmin: false
      }
    });

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'newuser@example.com' }
    });

    expect(mockHashPassword).toHaveBeenCalledWith('SecurePass123!');

    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        email: 'newuser@example.com',
        name: 'New User',
        password: 'hashedpassword123',
        isAdmin: false
      }
    });
  });

  test('一般ユーザーによる登録試行の拒否', async () => {
    const request = createMockRequest({
      email: 'test@example.com',
      name: 'Test User',
      password: 'SecurePass123!'
    }, false); // 一般ユーザーとして

    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(403);
    expect(responseData).toEqual({
      error: 'この操作には管理者権限が必要です'
    });

    expect(prisma.user.findUnique).not.toHaveBeenCalled();
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  test('メールアドレス重複時のエラー', async () => {
    // 既存ユーザーが存在
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      email: 'existing@example.com'
    });

    const request = createMockRequest({
      email: 'existing@example.com',
      name: 'Existing User',
      password: 'SecurePass123!'
    });

    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(400);
    expect(responseData).toEqual({
      success: false,
      message: 'このメールアドレスは既に使用されています'
    });

    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  test('必須フィールド未入力エラー - メールアドレス', async () => {
    const request = createMockRequest({
      name: 'Test User',
      password: 'SecurePass123!'
      // email フィールドなし
    });

    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(400);
    expect(responseData).toEqual({
      success: false,
      message: 'メールアドレス、名前、パスワードは必須です'
    });

    expect(prisma.user.findUnique).not.toHaveBeenCalled();
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  test('必須フィールド未入力エラー - パスワード', async () => {
    const request = createMockRequest({
      email: 'test@example.com',
      name: 'Test User'
      // password フィールドなし
    });

    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(400);
    expect(responseData).toEqual({
      success: false,
      message: 'メールアドレス、名前、パスワードは必須です'
    });
  });

  test('パスワードバリデーション失敗エラー', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    const request = createMockRequest({
      email: 'test@example.com',
      name: 'Test User',
      password: '123' // 短すぎるパスワード
    });

    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(400);
    expect(responseData).toEqual({
      success: false,
      message: 'パスワードは6文字以上で入力してください'
    });

    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  test('未認証ユーザーのアクセス拒否', async () => {
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    // Authorization ヘッダーなし

    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        email: 'test@example.com',
        name: 'Test User',
        password: 'SecurePass123!'
      })
    });

    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(401);
    expect(responseData).toEqual({
      error: '認証が必要です'
    });

    expect(prisma.user.create).not.toHaveBeenCalled();
  });
});
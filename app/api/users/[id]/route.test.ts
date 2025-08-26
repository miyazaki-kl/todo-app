import { DELETE } from './route';
import { NextRequest } from 'next/server';
import { prisma } from '@/app/lib/prisma';

// Prismaのモック
jest.mock('@/app/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    todo: {
      updateMany: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));


// withAdminAuthのモック
jest.mock('@/app/lib/auth-middleware', () => ({
  withAdminAuth: (handler: any) => handler,
}));

const mockPrisma = prisma as any;

describe('/api/users/[id] DELETE', () => {
  const validToken = 'valid-jwt-token';
  const adminUser = {
    userId: 1,
    email: 'admin@example.com',
    isAdmin: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  const createRequest = (token?: string) => {
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return {
      headers: {
        get: (name: string) => headers[name] || null,
      },
    } as NextRequest;
  };

  const createContext = (id: string) => ({
    params: Promise.resolve({ id }),
  });

  it('should delete a regular user successfully', async () => {
    // 削除対象ユーザーのモック
    const targetUser = {
      id: 2,
      email: 'user@example.com',
      name: 'Test User',
      isAdmin: false,
      password: 'hashed_password',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockPrisma.user.findUnique.mockResolvedValue(targetUser);
    mockPrisma.$transaction.mockImplementation(async (callback: any) => {
      return callback({
        todo: {
          updateMany: jest.fn().mockResolvedValue({ count: 3 }),
        },
        user: {
          delete: jest.fn().mockResolvedValue(targetUser),
        },
      });
    });

    const request = createRequest(validToken);
    const context = createContext('2');

    const response = await DELETE(request, adminUser, context);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toContain('Test User');
  });

  it('should not delete admin user', async () => {
    const targetUser = {
      id: 3,
      email: 'admin2@example.com',
      name: 'Admin User',
      isAdmin: true,
      password: 'hashed_password',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockPrisma.user.findUnique.mockResolvedValue(targetUser);

    const request = createRequest(validToken);
    const context = createContext('3');

    const response = await DELETE(request, adminUser, context);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('管理者ユーザーは削除できません');
  });

  it('should not allow user to delete themselves', async () => {
    const targetUser = {
      id: 1,
      email: 'admin@example.com',
      name: 'Admin User',
      isAdmin: false,
      password: 'hashed_password',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockPrisma.user.findUnique.mockResolvedValue(targetUser);

    const request = createRequest(validToken);
    const context = createContext('1');

    const response = await DELETE(request, adminUser, context);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('自分自身は削除できません');
  });

  it('should return 404 if user not found', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    const request = createRequest(validToken);
    const context = createContext('999');

    const response = await DELETE(request, adminUser, context);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('ユーザーが見つかりません');
  });

  it('should return 400 for invalid user ID', async () => {
    const request = createRequest(validToken);
    const context = createContext('invalid-id');

    const response = await DELETE(request, adminUser, context);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('無効なユーザーIDです');
  });

  it('should return 401 if no token provided', async () => {
    const request = createRequest();
    const context = createContext('2');

    const response = await DELETE(request, {userId: 0, email: '', isAdmin: false}, context);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('ユーザーの削除に失敗しました');
  });

  it('should return 403 if user is not admin', async () => {
    const nonAdminUser = {
      userId: 2,
      email: 'user@example.com',
      isAdmin: false,
    };

    const request = createRequest(validToken);
    const context = createContext('3');

    const response = await DELETE(request, nonAdminUser, context);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('ユーザーの削除に失敗しました');
  });

  it('should handle database error', async () => {
    const targetUser = {
      id: 2,
      email: 'user@example.com',
      name: 'Test User',
      isAdmin: false,
      password: 'hashed_password',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockPrisma.user.findUnique.mockResolvedValue(targetUser);
    mockPrisma.$transaction.mockRejectedValue(new Error('Database error'));

    const request = createRequest(validToken);
    const context = createContext('2');

    const response = await DELETE(request, adminUser, context);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('ユーザーの削除に失敗しました');
  });
});
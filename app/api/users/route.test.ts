import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// PrismaClientのモック
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    user: {
      findMany: jest.fn(),
    },
  })),
}));

describe('Users API', () => {
  let prisma: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    jest.resetModules();
    prisma = new PrismaClient() as jest.Mocked<PrismaClient>;
    (global as any).prisma = prisma;
  });

  describe('GET /api/users', () => {
    it('すべてのユーザーを取得できる', async () => {
      const mockUsers = [
        { id: 1, name: 'Alice', email: 'alice@example.com' },
        { id: 2, name: 'Bob', email: 'bob@example.com' },
        { id: 3, name: 'Charlie', email: 'charlie@example.com' },
      ];

      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);

      const { GET } = require('./route');
      const response = await GET();
      const data = await response.json();

      expect(response.constructor.name).toBe('NextResponse');
      expect(data).toEqual(mockUsers);
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          name: true,
          email: true,
        },
        orderBy: {
          name: 'asc',
        },
      });
    });

    it('ユーザーが名前順（昇順）で取得される', async () => {
      const mockUsers = [
        { id: 3, name: 'Alice', email: 'alice@example.com' },
        { id: 1, name: 'Bob', email: 'bob@example.com' },
        { id: 2, name: 'Charlie', email: 'charlie@example.com' },
      ];

      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);

      const { GET } = require('./route');
      const response = await GET();
      const data = await response.json();

      expect(response.constructor.name).toBe('NextResponse');
      expect(data).toEqual(mockUsers);
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          name: true,
          email: true,
        },
        orderBy: {
          name: 'asc',
        },
      });
    });

    it('パスワードフィールドが除外される', async () => {
      const mockUsers = [
        { id: 1, name: 'Alice', email: 'alice@example.com' },
        { id: 2, name: 'Bob', email: 'bob@example.com' },
      ];

      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);

      const { GET } = require('./route');
      const response = await GET();
      const data = await response.json();

      expect(response.constructor.name).toBe('NextResponse');
      expect(data).toEqual(mockUsers);
      
      // パスワードフィールドが含まれていないことを確認
      data.forEach((user: any) => {
        expect(user).not.toHaveProperty('password');
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('name');
        expect(user).toHaveProperty('email');
      });

      // selectでパスワードが除外されていることを確認
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          name: true,
          email: true,
        },
        orderBy: {
          name: 'asc',
        },
      });
    });

    it('ユーザーが存在しない場合は空配列を返す', async () => {
      (prisma.user.findMany as jest.Mock).mockResolvedValue([]);

      const { GET } = require('./route');
      const response = await GET();
      const data = await response.json();

      expect(response.constructor.name).toBe('NextResponse');
      expect(data).toEqual([]);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(0);
    });

    it('データベースエラー時に適切なエラーレスポンスを返す', async () => {
      (prisma.user.findMany as jest.Mock).mockRejectedValue(new Error('DBエラー'));

      const { GET } = require('./route');
      const response = await GET();
      const data = await response.json();

      expect(response.constructor.name).toBe('NextResponse');
      expect(data).toEqual({ error: 'ユーザーの取得に失敗しました' });
      expect(response.status).toBe(500);
    });

    it('完全なユーザーデータ構造を返す', async () => {
      const mockUsers = [
        { id: 1, name: 'Test User', email: 'test@example.com' },
      ];

      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);

      const { GET } = require('./route');
      const response = await GET();
      const data = await response.json();

      expect(response.constructor.name).toBe('NextResponse');
      expect(data).toEqual(mockUsers);
      
      // レスポンスデータの構造を検証
      expect(data[0]).toEqual({
        id: expect.any(Number),
        name: expect.any(String),
        email: expect.any(String),
      });
    });
  });
});
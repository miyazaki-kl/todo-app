import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// PrismaClientのモック
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    todo: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  })),
}));

describe('Todo API', () => {
  let prisma: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    jest.resetModules();
    prisma = new PrismaClient() as jest.Mocked<PrismaClient>;
    (global as any).prisma = prisma;
  });

  describe('GET /api/todos', () => {
    it('すべてのTodoを取得できる', async () => {
      const now = new Date();
      const mockTodos = [
        { id: 1, title: 'テスト1', description: '説明1', completed: false, createdAt: now, updatedAt: now },
        { id: 2, title: 'テスト2', description: '説明2', completed: true, createdAt: now, updatedAt: now },
      ];

      (prisma.todo.findMany as jest.Mock).mockResolvedValue(mockTodos);

      const { GET } = require('./route');
      const response = await GET();
      const data = await response.json();

      expect(response.constructor.name).toBe('NextResponse');
      expect(data).toEqual(
        mockTodos.map(todo => ({
          ...todo,
          createdAt: todo.createdAt.toISOString(),
          updatedAt: todo.updatedAt.toISOString(),
        }))
      );
      expect(prisma.todo.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
    });

    it('エラー時に適切なエラーレスポンスを返す', async () => {
      (prisma.todo.findMany as jest.Mock).mockRejectedValue(new Error('DBエラー'));
      const { GET } = require('./route');
      const response = await GET();
      const data = await response.json();

      expect(response.constructor.name).toBe('NextResponse');
      expect(data).toEqual({ error: 'Todoの取得に失敗しました' });
      expect(response.status).toBe(500);
    });
  });

  describe('POST /api/todos', () => {
    it('新しいTodoを作成できる', async () => {
      const now = new Date();
      const mockTodo = {
        id: 1,
        title: '新しいTodo',
        description: '説明',
        completed: false,
        createdAt: now,
        updatedAt: now,
      };

      (prisma.todo.create as jest.Mock).mockResolvedValue(mockTodo);

      const { POST } = require('./route');
      const request = new Request('http://localhost:3000/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '新しいTodo',
          description: '説明',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.constructor.name).toBe('NextResponse');
      expect(data).toEqual({
        ...mockTodo,
        createdAt: mockTodo.createdAt.toISOString(),
        updatedAt: mockTodo.updatedAt.toISOString(),
      });
      expect(response.status).toBe(201);
      expect(prisma.todo.create).toHaveBeenCalledWith({
        data: {
          title: '新しいTodo',
          description: '説明',
        },
      });
    });

    it('タイトルが未指定の場合はエラーを返す', async () => {
      const { POST } = require('./route');
      const request = new Request('http://localhost:3000/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: '説明',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.constructor.name).toBe('NextResponse');
      expect(data).toEqual({ error: 'タイトルは必須です' });
      expect(response.status).toBe(400);
    });

    it('エラー時に適切なエラーレスポンスを返す', async () => {
      (prisma.todo.create as jest.Mock).mockRejectedValue(new Error('DBエラー'));
      const { POST } = require('./route');
      const request = new Request('http://localhost:3000/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '新しいTodo',
          description: '説明',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.constructor.name).toBe('NextResponse');
      expect(data).toEqual({ error: 'Todoの作成に失敗しました' });
      expect(response.status).toBe(500);
    });
  });
}); 
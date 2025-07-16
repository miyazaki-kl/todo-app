import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// PrismaClientのモック
const mockPrisma = {
  todo: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
};

// グローバルprismaのモック
(global as any).prisma = mockPrisma;

describe('Todo API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/todos', () => {
    it('すべてのTodoを取得できる', async () => {
      const now = new Date();
      const mockTodos = [
        { 
          id: 1, 
          title: 'テスト1', 
          description: '説明1', 
          completed: false, 
          createdAt: now.toISOString(), 
          updatedAt: now.toISOString(),
          createdBy: { id: 1, name: 'User 1', email: 'user1@example.com' },
          assignedTo: null,
          labels: []
        },
        { 
          id: 2, 
          title: 'テスト2', 
          description: '説明2', 
          completed: true, 
          createdAt: now.toISOString(), 
          updatedAt: now.toISOString(),
          createdBy: { id: 2, name: 'User 2', email: 'user2@example.com' },
          assignedTo: { id: 1, name: 'User 1', email: 'user1@example.com' },
          labels: []
        },
      ];

      // Mock the prisma response with Date objects (as it would come from DB)
      const mockDbTodos = mockTodos.map(todo => ({
        ...todo,
        createdAt: now,
        updatedAt: now,
      }));

      (mockPrisma.todo.findMany as jest.Mock).mockResolvedValue(mockDbTodos);

      const { GET } = require('./route');
      const request = new Request('http://localhost:3000/api/todos');
      const response = await GET(request);
      const data = await response.json();

      expect(response.constructor.name).toBe('NextResponse');
      expect(data).toEqual(mockTodos);
      expect(mockPrisma.todo.findMany).toHaveBeenCalledWith({
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          labels: {
            include: {
              label: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('エラー時に適切なエラーレスポンスを返す', async () => {
      (mockPrisma.todo.findMany as jest.Mock).mockRejectedValue(new Error('DBエラー'));
      const { GET } = require('./route');
      const request = new Request('http://localhost:3000/api/todos');
      const response = await GET(request);
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
        createdBy: { id: 1, name: 'User 1', email: 'user1@example.com' },
        assignedTo: null,
        labels: []
      };

      (mockPrisma.todo.create as jest.Mock).mockResolvedValue(mockTodo);

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
      expect(mockPrisma.todo.create).toHaveBeenCalledWith({
        data: {
          title: '新しいTodo',
          description: '説明',
          createdById: undefined,
          assignedToId: undefined,
          labels: undefined,
        },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          labels: {
            include: {
              label: true,
            },
          },
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
      (mockPrisma.todo.create as jest.Mock).mockRejectedValue(new Error('DBエラー'));
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
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// PrismaClientのモック
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    todo: {
      update: jest.fn(),
      delete: jest.fn(),
    },
  })),
}));

describe('Todo API (特定のID)', () => {
  let prisma: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    jest.resetModules();
    prisma = new PrismaClient() as jest.Mocked<PrismaClient>;
    (global as any).prisma = prisma;
    jest.clearAllMocks();
  });

  describe('PUT /api/todos/[id]', () => {
    it('Todoを更新できる', async () => {
      const now = new Date();
      const mockTodo = {
        id: 1,
        title: '更新されたTodo',
        description: '更新された説明',
        completed: true,
        createdAt: now,
        updatedAt: now,
      };

      (prisma.todo.update as jest.Mock).mockResolvedValue(mockTodo);

      const { PUT } = require('../[id]/route');
      const request = new Request('http://localhost:3000/api/todos/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '更新されたTodo',
          description: '更新された説明',
          completed: true,
        }),
      });

      const response = await PUT(request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.constructor.name).toBe('NextResponse');
      expect(data).toEqual({
        ...mockTodo,
        createdAt: mockTodo.createdAt.toISOString(),
        updatedAt: mockTodo.updatedAt.toISOString(),
      });
      expect(prisma.todo.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          title: '更新されたTodo',
          description: '更新された説明',
          completed: true,
        },
      });
    });

    it('タイトルが未指定の場合はエラーを返す', async () => {
      const { PUT } = require('../[id]/route');
      const request = new Request('http://localhost:3000/api/todos/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: '更新された説明',
        }),
      });

      const response = await PUT(request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.constructor.name).toBe('NextResponse');
      expect(data).toEqual({ error: 'タイトルは必須です' });
      expect(response.status).toBe(400);
    });

    it('無効なIDの場合はエラーを返す', async () => {
      const { PUT } = require('../[id]/route');
      const request = new Request('http://localhost:3000/api/todos/invalid', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '更新されたTodo',
        }),
      });

      const response = await PUT(request, { params: { id: 'invalid' } });
      const data = await response.json();

      expect(response.constructor.name).toBe('NextResponse');
      expect(data).toEqual({ error: '無効なIDです' });
      expect(response.status).toBe(400);
    });

    it('存在しないTodoの場合はエラーを返す', async () => {
      const error = new Error('Record to update does not exist');
      (error as any).code = 'P2025';
      (prisma.todo.update as jest.Mock).mockRejectedValue(error);

      const { PUT } = require('../[id]/route');
      const request = new Request('http://localhost:3000/api/todos/999', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '更新されたTodo',
        }),
      });

      const response = await PUT(request, { params: { id: '999' } });
      const data = await response.json();

      expect(response.constructor.name).toBe('NextResponse');
      expect(data).toEqual({ error: '指定されたTodoが見つかりません' });
      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/todos/[id]', () => {
    it('Todoを削除できる', async () => {
      const now = new Date();
      const mockTodo = {
        id: 1,
        title: '削除されるTodo',
        description: '説明',
        completed: false,
        createdAt: now,
        updatedAt: now,
      };

      (prisma.todo.delete as jest.Mock).mockResolvedValue(mockTodo);

      const { DELETE } = require('../[id]/route');
      const request = new Request('http://localhost:3000/api/todos/1', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.constructor.name).toBe('NextResponse');
      expect(data).toEqual({
        ...mockTodo,
        createdAt: mockTodo.createdAt.toISOString(),
        updatedAt: mockTodo.updatedAt.toISOString(),
      });
      expect(prisma.todo.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('無効なIDの場合はエラーを返す', async () => {
      const { DELETE } = require('../[id]/route');
      const request = new Request('http://localhost:3000/api/todos/invalid', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { id: 'invalid' } });
      const data = await response.json();

      expect(response.constructor.name).toBe('NextResponse');
      expect(data).toEqual({ error: '無効なIDです' });
      expect(response.status).toBe(400);
    });

    it('存在しないTodoの場合はエラーを返す', async () => {
      const error = new Error('Record to delete does not exist');
      (error as any).code = 'P2025';
      (prisma.todo.delete as jest.Mock).mockRejectedValue(error);

      const { DELETE } = require('../[id]/route');
      const request = new Request('http://localhost:3000/api/todos/999', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { id: '999' } });
      const data = await response.json();

      expect(response.constructor.name).toBe('NextResponse');
      expect(data).toEqual({ error: '指定されたTodoが見つかりません' });
      expect(response.status).toBe(404);
    });
  });
}); 
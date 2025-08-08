import {
  createMockPrismaClient,
  MockPrismaClient,
  setupApiTest,
  MockData,
  convertDatesToISOStrings,
  assertApiResponse,
  HttpStatus,
  ErrorResponses,
  DatabaseErrors,
  mockWithAuth
} from '../../__tests__/test-utils';

// Create standardized mock Prisma client
const mockPrisma = createMockPrismaClient();

// Mock global prisma
(global as any).prisma = mockPrisma;

describe('Todo API (特定のID)', () => {
  // Use standardized test setup
  setupApiTest(mockPrisma);
  
  beforeEach(() => {
    mockWithAuth();
  });

  describe('PUT /api/todos/[id]', () => {
    it('Todoを更新できる', async () => {
      const mockTodo = MockData.todo({
        id: 1,
        title: '更新されたTodo',
        description: '更新された説明',
        completed: true,
      });

      mockPrisma.todo.update.mockResolvedValue(mockTodo);

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

      await assertApiResponse(response, HttpStatus.OK, convertDatesToISOStrings(mockTodo));
      expect(mockPrisma.todo.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          title: '更新されたTodo',
          description: '更新された説明',
          completed: true,
          assignedToId: undefined,
          projectId: undefined,
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
          project: {
            select: {
              id: true,
              name: true,
              description: true,
              color: true,
              createdBy: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
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
      const { PUT } = require('../[id]/route');
      const request = new Request('http://localhost:3000/api/todos/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: '更新された説明',
        }),
      });

      const response = await PUT(request, { params: { id: '1' } });

      await assertApiResponse(response, HttpStatus.BAD_REQUEST, ErrorResponses.VALIDATION_ERROR('タイトルは必須です'));
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

      await assertApiResponse(response, HttpStatus.BAD_REQUEST, ErrorResponses.VALIDATION_ERROR('無効なIDです'));
    });

    it('存在しないTodoの場合はエラーを返す', async () => {
      const error = new Error('Record to update does not exist');
      (error as any).code = 'P2025';
      mockPrisma.todo.update.mockRejectedValue(error);

      const { PUT } = require('../[id]/route');
      const request = new Request('http://localhost:3000/api/todos/999', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '更新されたTodo',
        }),
      });

      const response = await PUT(request, { params: { id: '999' } });

      await assertApiResponse(response, HttpStatus.NOT_FOUND, ErrorResponses.NOT_FOUND_ERROR('指定されたTodoが見つかりません'));
    });
  });

  describe('DELETE /api/todos/[id]', () => {
    it('Todoを削除できる', async () => {
      const mockTodo = MockData.todo({
        id: 1,
        title: '削除されるTodo',
        description: '説明',
        completed: false,
      });

      mockPrisma.todo.delete.mockResolvedValue(mockTodo);

      const { DELETE } = require('../[id]/route');
      const request = new Request('http://localhost:3000/api/todos/1', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { id: '1' } });

      await assertApiResponse(response, HttpStatus.OK, convertDatesToISOStrings(mockTodo));
      expect(mockPrisma.todo.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('無効なIDの場合はエラーを返す', async () => {
      const { DELETE } = require('../[id]/route');
      const request = new Request('http://localhost:3000/api/todos/invalid', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { id: 'invalid' } });

      await assertApiResponse(response, HttpStatus.BAD_REQUEST, ErrorResponses.VALIDATION_ERROR('無効なIDです'));
    });

    it('存在しないTodoの場合はエラーを返す', async () => {
      const error = new Error('Record to delete does not exist');
      (error as any).code = 'P2025';
      mockPrisma.todo.delete.mockRejectedValue(error);

      const { DELETE } = require('../[id]/route');
      const request = new Request('http://localhost:3000/api/todos/999', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { id: '999' } });

      await assertApiResponse(response, HttpStatus.NOT_FOUND, ErrorResponses.NOT_FOUND_ERROR('指定されたTodoが見つかりません'));
    });
  });
}); 
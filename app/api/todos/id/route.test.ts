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

      // 現在のTodoの状態をモック（完了状態変更検知のため）
      mockPrisma.todo.findUnique.mockResolvedValue({ completed: false });
      mockPrisma.todo.update.mockResolvedValue(mockTodo);
      mockPrisma.todoLabel.deleteMany.mockResolvedValue({ count: 0 });

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
      expect(mockPrisma.todo.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        select: { completed: true }
      });
      expect(mockPrisma.todoLabel.deleteMany).toHaveBeenCalledWith({
        where: { todoId: 1 },
      });
      expect(mockPrisma.todo.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          title: '更新されたTodo',
          description: '更新された説明',
          completed: true,
          dueDate: null,
          completedAt: expect.any(Date),
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
      // findUniqueでnullを返してTodoが見つからないことをシミュレート
      mockPrisma.todo.findUnique.mockResolvedValue(null);

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

    it('完了状態を未完了から完了に変更した場合、completedAtが自動設定される', async () => {
      const mockTodo = MockData.todo({
        id: 1,
        title: 'テストTodo',
        description: 'テスト説明',
        completed: true,
      });

      // 現在のTodoの状態は未完了
      mockPrisma.todo.findUnique.mockResolvedValue({ completed: false });
      mockPrisma.todo.update.mockResolvedValue(mockTodo);
      mockPrisma.todoLabel.deleteMany.mockResolvedValue({ count: 0 });

      const { PUT } = require('../[id]/route');
      const request = new Request('http://localhost:3000/api/todos/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'テストTodo',
          description: 'テスト説明',
          completed: true,
        }),
      });

      const response = await PUT(request, { params: { id: '1' } });

      expect(response.status).toBe(200);
      expect(mockPrisma.todo.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            completed: true,
            completedAt: expect.any(Date)
          })
        })
      );
    });

    it('完了状態を完了から未完了に変更した場合、completedAtがnullに設定される', async () => {
      const mockTodo = MockData.todo({
        id: 1,
        title: 'テストTodo',
        description: 'テスト説明',
        completed: false,
      });

      // 現在のTodoの状態は完了
      mockPrisma.todo.findUnique.mockResolvedValue({ completed: true });
      mockPrisma.todo.update.mockResolvedValue(mockTodo);
      mockPrisma.todoLabel.deleteMany.mockResolvedValue({ count: 0 });

      const { PUT } = require('../[id]/route');
      const request = new Request('http://localhost:3000/api/todos/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'テストTodo',
          description: 'テスト説明',
          completed: false,
        }),
      });

      const response = await PUT(request, { params: { id: '1' } });

      expect(response.status).toBe(200);
      expect(mockPrisma.todo.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            completed: false,
            completedAt: null
          })
        })
      );
    });

    it('dueDateを含むTodoを更新できる', async () => {
      const mockTodo = MockData.todo({
        id: 1,
        title: '期限付きTodo',
        description: '完了予定日が設定されたTodo',
        completed: false,
      });

      mockPrisma.todo.findUnique.mockResolvedValue({ completed: false });
      mockPrisma.todo.update.mockResolvedValue(mockTodo);
      mockPrisma.todoLabel.deleteMany.mockResolvedValue({ count: 0 });

      const { PUT } = require('../[id]/route');
      const request = new Request('http://localhost:3000/api/todos/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '期限付きTodo',
          description: '完了予定日が設定されたTodo',
          completed: false,
          dueDate: '2024-12-31',
        }),
      });

      const response = await PUT(request, { params: { id: '1' } });

      expect(response.status).toBe(200);
      expect(mockPrisma.todo.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            dueDate: new Date('2024-12-31')
          })
        })
      );
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
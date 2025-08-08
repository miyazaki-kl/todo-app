import {
  createMockPrismaClient,
  MockPrismaClient,
  setupApiTest,
  MockData,
  convertDatesToISOStrings,
  assertApiResponse,
  HttpStatus,
  ErrorResponses,
  PrismaQueries,
  DatabaseErrors,
} from '../__tests__/test-utils';

// Create standardized mock Prisma client
const mockPrisma = createMockPrismaClient();

// Mock global prisma
(global as any).prisma = mockPrisma;

describe('Todo API', () => {
  // Use standardized test setup
  setupApiTest(mockPrisma);

  describe('GET /api/todos', () => {
    it('すべてのTodoを取得できる', async () => {
      const mockDbTodos = [
        MockData.todo({ 
          id: 1, 
          title: 'テスト1', 
          description: '説明1', 
          completed: false,
          createdBy: MockData.userWithoutPassword({ id: 1, name: 'User 1', email: 'user1@example.com' }),
          assignedTo: null,
          labels: []
        }),
        MockData.todo({ 
          id: 2, 
          title: 'テスト2', 
          description: '説明2', 
          completed: true,
          createdBy: MockData.userWithoutPassword({ id: 2, name: 'User 2', email: 'user2@example.com' }),
          assignedTo: MockData.userWithoutPassword({ id: 1, name: 'User 1', email: 'user1@example.com' }),
          labels: []
        }),
      ];

      mockPrisma.todo.findMany.mockResolvedValue(mockDbTodos);

      const { GET } = require('./route');
      const request = new Request('http://localhost:3000/api/todos');
      const response = await GET(request);

      await assertApiResponse(response, HttpStatus.OK, convertDatesToISOStrings(mockDbTodos));
      expect(mockPrisma.todo.findMany).toHaveBeenCalledWith(PrismaQueries.TODO_INCLUDE_RELATIONS);
    });

    it('currentUserIdが指定された場合、そのユーザーに割り当てられたTodoを優先して返す', async () => {
      const now = new Date();
      const mockDbTodos = [
        { 
          id: 1, 
          title: 'General Todo', 
          description: '一般的なタスク', 
          completed: false, 
          createdAt: now, 
          updatedAt: now,
          assignedToId: 2,
          createdBy: { id: 1, name: 'User 1', email: 'user1@example.com' },
          assignedTo: { id: 2, name: 'User 2', email: 'user2@example.com' },
          labels: []
        },
        { 
          id: 2, 
          title: 'My Assigned Todo', 
          description: '私に割り当てられたタスク', 
          completed: false, 
          createdAt: now, 
          updatedAt: now,
          assignedToId: 1,
          createdBy: { id: 2, name: 'User 2', email: 'user2@example.com' },
          assignedTo: { id: 1, name: 'User 1', email: 'user1@example.com' },
          labels: []
        },
        { 
          id: 3, 
          title: 'Another Assigned Todo', 
          description: '私に割り当てられた別のタスク', 
          completed: true, 
          createdAt: now, 
          updatedAt: now,
          assignedToId: 1,
          createdBy: { id: 2, name: 'User 2', email: 'user2@example.com' },
          assignedTo: { id: 1, name: 'User 1', email: 'user1@example.com' },
          labels: []
        },
      ];

      (mockPrisma.todo.findMany as jest.Mock).mockResolvedValue(mockDbTodos);

      const { GET } = require('./route');
      const request = new Request('http://localhost:3000/api/todos?currentUserId=1');
      const response = await GET(request);
      const data = await response.json();

      expect(response.constructor.name).toBe('NextResponse');
      // 割り当てられたTodo（id: 2, 3）が最初に来て、その後に他のTodo（id: 1）が来る
      expect(data).toHaveLength(3);
      expect(data[0].id).toBe(2);
      expect(data[1].id).toBe(3);
      expect(data[2].id).toBe(1);
      expect(data[0].assignedTo.id).toBe(1);
      expect(data[1].assignedTo.id).toBe(1);
      expect(data[2].assignedTo.id).toBe(2);
    });

    it('関係データ（createdBy、assignedTo、labels）が正しく含まれる', async () => {
      const now = new Date();
      const mockDbTodos = [
        { 
          id: 1, 
          title: 'Todo with Relations', 
          description: '関係データを持つTodo', 
          completed: false, 
          createdAt: now, 
          updatedAt: now,
          assignedToId: 2,
          createdBy: { id: 1, name: 'Creator User', email: 'creator@example.com' },
          assignedTo: { id: 2, name: 'Assigned User', email: 'assigned@example.com' },
          labels: [
            {
              label: { id: 1, name: 'Important', color: 'red' }
            },
            {
              label: { id: 2, name: 'Urgent', color: 'orange' }
            }
          ]
        },
      ];

      (mockPrisma.todo.findMany as jest.Mock).mockResolvedValue(mockDbTodos);

      const { GET } = require('./route');
      const request = new Request('http://localhost:3000/api/todos');
      const response = await GET(request);
      const data = await response.json();

      expect(response.constructor.name).toBe('NextResponse');
      expect(data).toHaveLength(1);
      
      const todo = data[0];
      // createdBy関係データの検証
      expect(todo.createdBy).toEqual({
        id: 1,
        name: 'Creator User',
        email: 'creator@example.com'
      });
      
      // assignedTo関係データの検証
      expect(todo.assignedTo).toEqual({
        id: 2,
        name: 'Assigned User',
        email: 'assigned@example.com'
      });
      
      // labels関係データの検証
      expect(todo.labels).toHaveLength(2);
      expect(todo.labels[0].label).toEqual({
        id: 1,
        name: 'Important',
        color: 'red'
      });
      expect(todo.labels[1].label).toEqual({
        id: 2,
        name: 'Urgent',
        color: 'orange'
      });
    });

    it('エラー時に適切なエラーレスポンスを返す', async () => {
      mockPrisma.todo.findMany.mockRejectedValue(DatabaseErrors.CONNECTION_FAILED);
      
      const { GET } = require('./route');
      const request = new Request('http://localhost:3000/api/todos');
      const response = await GET(request);

      await assertApiResponse(response, HttpStatus.INTERNAL_SERVER_ERROR, ErrorResponses.SERVER_ERROR('Todoの取得に失敗しました'));
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
          projectId: 1,
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
          projectId: 1,
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

      await assertApiResponse(response, HttpStatus.BAD_REQUEST, ErrorResponses.VALIDATION_ERROR('タイトルは必須です'));
    });

    it('ラベル割り当てを含むTodoを作成できる', async () => {
      const now = new Date();
      const mockTodo = {
        id: 1,
        title: 'ラベル付きTodo',
        description: 'ラベルが割り当てられたTodo',
        completed: false,
        createdAt: now,
        updatedAt: now,
        createdBy: { id: 1, name: 'User 1', email: 'user1@example.com' },
        assignedTo: null,
        labels: [
          {
            label: { id: 1, name: 'Important', color: 'red' }
          },
          {
            label: { id: 2, name: 'Urgent', color: 'orange' }
          }
        ]
      };

      (mockPrisma.todo.create as jest.Mock).mockResolvedValue(mockTodo);

      const { POST } = require('./route');
      const request = new Request('http://localhost:3000/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'ラベル付きTodo',
          description: 'ラベルが割り当てられたTodo',
          createdById: 1,
          projectId: 1,
          labelIds: [1, 2],
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
          title: 'ラベル付きTodo',
          description: 'ラベルが割り当てられたTodo',
          createdById: 1,
          assignedToId: undefined,
          projectId: 1,
          labels: {
            create: [
              { labelId: 1 },
              { labelId: 2 }
            ]
          },
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
        },
      });
      
      // ラベル関係データの検証
      expect(data.labels).toHaveLength(2);
      expect(data.labels[0].label).toEqual({
        id: 1,
        name: 'Important',
        color: 'red'
      });
      expect(data.labels[1].label).toEqual({
        id: 2,
        name: 'Urgent',
        color: 'orange'
      });
    });

    it('ユーザー割り当て（createdBy、assignedTo）を含むTodoを作成できる', async () => {
      const now = new Date();
      const mockTodo = {
        id: 1,
        title: 'ユーザー割り当てTodo',
        description: 'ユーザーが割り当てられたTodo',
        completed: false,
        createdAt: now,
        updatedAt: now,
        createdBy: { id: 1, name: 'Creator User', email: 'creator@example.com' },
        assignedTo: { id: 2, name: 'Assigned User', email: 'assigned@example.com' },
        labels: []
      };

      (mockPrisma.todo.create as jest.Mock).mockResolvedValue(mockTodo);

      const { POST } = require('./route');
      const request = new Request('http://localhost:3000/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'ユーザー割り当てTodo',
          description: 'ユーザーが割り当てられたTodo',
          createdById: 1,
          assignedToId: 2,
          projectId: 1,
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
          title: 'ユーザー割り当てTodo',
          description: 'ユーザーが割り当てられたTodo',
          createdById: 1,
          assignedToId: 2,
          projectId: 1,
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
        },
      });
      
      // ユーザー関係データの検証
      expect(data.createdBy).toEqual({
        id: 1,
        name: 'Creator User',
        email: 'creator@example.com'
      });
      expect(data.assignedTo).toEqual({
        id: 2,
        name: 'Assigned User',
        email: 'assigned@example.com'
      });
    });

    it('ラベルとユーザー割り当ての両方を含むTodoを作成できる', async () => {
      const now = new Date();
      const mockTodo = {
        id: 1,
        title: '完全なTodo',
        description: 'ラベルとユーザー割り当ての両方を含むTodo',
        completed: false,
        createdAt: now,
        updatedAt: now,
        createdBy: { id: 1, name: 'Creator User', email: 'creator@example.com' },
        assignedTo: { id: 2, name: 'Assigned User', email: 'assigned@example.com' },
        labels: [
          {
            label: { id: 1, name: 'Important', color: 'red' }
          }
        ]
      };

      (mockPrisma.todo.create as jest.Mock).mockResolvedValue(mockTodo);

      const { POST } = require('./route');
      const request = new Request('http://localhost:3000/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '完全なTodo',
          description: 'ラベルとユーザー割り当ての両方を含むTodo',
          createdById: 1,
          assignedToId: 2,
          projectId: 1,
          labelIds: [1],
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
          title: '完全なTodo',
          description: 'ラベルとユーザー割り当ての両方を含むTodo',
          createdById: 1,
          assignedToId: 2,
          projectId: 1,
          labels: {
            create: [
              { labelId: 1 }
            ]
          },
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
        },
      });
      
      // 全ての関係データの検証
      expect(data.createdBy).toEqual({
        id: 1,
        name: 'Creator User',
        email: 'creator@example.com'
      });
      expect(data.assignedTo).toEqual({
        id: 2,
        name: 'Assigned User',
        email: 'assigned@example.com'
      });
      expect(data.labels).toHaveLength(1);
      expect(data.labels[0].label).toEqual({
        id: 1,
        name: 'Important',
        color: 'red'
      });
    });

    it('空のlabelIds配列が指定された場合、ラベル関係を作成しない', async () => {
      const now = new Date();
      const mockTodo = {
        id: 1,
        title: '空ラベルTodo',
        description: '空のラベル配列を持つTodo',
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
          title: '空ラベルTodo',
          description: '空のラベル配列を持つTodo',
          createdById: 1,
          projectId: 1,
          labelIds: [],
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.constructor.name).toBe('NextResponse');
      expect(response.status).toBe(201);
      expect(mockPrisma.todo.create).toHaveBeenCalledWith({
        data: {
          title: '空ラベルTodo',
          description: '空のラベル配列を持つTodo',
          createdById: 1,
          assignedToId: undefined,
          projectId: 1,
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
        },
      });
      expect(data.labels).toEqual([]);
    });

    it('エラー時に適切なエラーレスポンスを返す', async () => {
      mockPrisma.todo.create.mockRejectedValue(DatabaseErrors.CONNECTION_FAILED);
      
      const { POST } = require('./route');
      const request = new Request('http://localhost:3000/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '新しいTodo',
          description: '説明',
          projectId: 1,
        }),
      });

      const response = await POST(request);

      await assertApiResponse(response, HttpStatus.INTERNAL_SERVER_ERROR, ErrorResponses.SERVER_ERROR('Todoの作成に失敗しました'));
    });
  });
}); 
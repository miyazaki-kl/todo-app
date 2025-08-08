import {
  createMockPrismaClient,
  MockPrismaClient,
  setupApiTest,
  MockData,
  assertApiResponse,
  HttpStatus,
  ErrorResponses,
  PrismaQueries,
  DatabaseErrors,
  createAuthenticatedMockRequest,
  mockWithAuth
} from '../__tests__/test-utils';

// Create standardized mock Prisma client
const mockPrisma = createMockPrismaClient();

// Mock global prisma
(global as any).prisma = mockPrisma;

describe('Users API', () => {
  // Use standardized test setup
  setupApiTest(mockPrisma);
  
  beforeEach(() => {
    mockWithAuth();
  });

  describe('GET /api/users', () => {
    it('すべてのユーザーを取得できる', async () => {
      const mockUsers = [
        MockData.userWithoutPassword({ id: 1, name: 'Alice', email: 'alice@example.com' }),
        MockData.userWithoutPassword({ id: 2, name: 'Bob', email: 'bob@example.com' }),
        MockData.userWithoutPassword({ id: 3, name: 'Charlie', email: 'charlie@example.com' }),
      ];

      mockPrisma.user.findMany.mockResolvedValue(mockUsers);

      const { GET } = require('./route');
      const response = await GET();

      await assertApiResponse(response, HttpStatus.OK, mockUsers);
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(PrismaQueries.USER_SELECT_SAFE);
    });

    it('ユーザーが名前順（昇順）で取得される', async () => {
      const mockUsers = [
        MockData.userWithoutPassword({ id: 3, name: 'Alice', email: 'alice@example.com' }),
        MockData.userWithoutPassword({ id: 1, name: 'Bob', email: 'bob@example.com' }),
        MockData.userWithoutPassword({ id: 2, name: 'Charlie', email: 'charlie@example.com' }),
      ];

      mockPrisma.user.findMany.mockResolvedValue(mockUsers);

      const { GET } = require('./route');
      const response = await GET();

      await assertApiResponse(response, HttpStatus.OK, mockUsers);
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(PrismaQueries.USER_SELECT_SAFE);
    });

    it('パスワードフィールドが除外される', async () => {
      const mockUsers = [
        MockData.userWithoutPassword({ id: 1, name: 'Alice', email: 'alice@example.com' }),
        MockData.userWithoutPassword({ id: 2, name: 'Bob', email: 'bob@example.com' }),
      ];

      mockPrisma.user.findMany.mockResolvedValue(mockUsers);

      const { GET } = require('./route');
      const response = await GET();

      const data = await assertApiResponse(response, HttpStatus.OK, mockUsers);
      
      // パスワードフィールドが含まれていないことを確認
      data.forEach((user: any) => {
        expect(user).not.toHaveProperty('password');
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('name');
        expect(user).toHaveProperty('email');
      });

      // selectでパスワードが除外されていることを確認
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(PrismaQueries.USER_SELECT_SAFE);
    });

    it('ユーザーが存在しない場合は空配列を返す', async () => {
      mockPrisma.user.findMany.mockResolvedValue([]);

      const { GET } = require('./route');
      const response = await GET();

      await assertApiResponse(response, HttpStatus.OK, []);
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(PrismaQueries.USER_SELECT_SAFE);
    });

    it('データベースエラー時に適切なエラーレスポンスを返す', async () => {
      mockPrisma.user.findMany.mockRejectedValue(DatabaseErrors.CONNECTION_FAILED);

      const { GET } = require('./route');
      const response = await GET();

      await assertApiResponse(response, HttpStatus.INTERNAL_SERVER_ERROR, ErrorResponses.SERVER_ERROR('ユーザーの取得に失敗しました'));
    });

    it('完全なユーザーデータ構造を返す', async () => {
      const mockUsers = [
        MockData.userWithoutPassword({ id: 1, name: 'Test User', email: 'test@example.com' }),
      ];

      mockPrisma.user.findMany.mockResolvedValue(mockUsers);

      const { GET } = require('./route');
      const response = await GET();

      const data = await assertApiResponse(response, HttpStatus.OK, mockUsers);
      
      // レスポンスデータの構造を検証
      expect(data[0]).toEqual({
        id: expect.any(Number),
        name: expect.any(String),
        email: expect.any(String),
      });
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(PrismaQueries.USER_SELECT_SAFE);
    });
  });
});
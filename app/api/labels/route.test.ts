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
  mockWithAuth
} from '../__tests__/test-utils';

// Create standardized mock Prisma client
const mockPrisma = createMockPrismaClient();

// Mock global prisma
(global as any).prisma = mockPrisma;

describe('Labels API', () => {
  // Use standardized test setup
  setupApiTest(mockPrisma);
  
  beforeEach(() => {
    mockWithAuth();
  });

  describe('GET /api/labels', () => {
    it('すべてのラベルを名前順で取得できる', async () => {
      const mockDbLabels = [
        MockData.label({ id: 1, name: 'Important', color: 'red' }),
        MockData.label({ id: 2, name: 'Urgent', color: 'orange' }),
      ];

      mockPrisma.label.findMany.mockResolvedValue(mockDbLabels);

      const { GET } = require('./route');
      const response = await GET();

      await assertApiResponse(response, HttpStatus.OK, convertDatesToISOStrings(mockDbLabels));
      expect(mockPrisma.label.findMany).toHaveBeenCalledWith(PrismaQueries.LABEL_ORDER_BY_NAME);
    });

    it('ラベルが存在しない場合は空配列を返す', async () => {
      mockPrisma.label.findMany.mockResolvedValue([]);

      const { GET } = require('./route');
      const response = await GET();

      await assertApiResponse(response, HttpStatus.OK, []);
      expect(mockPrisma.label.findMany).toHaveBeenCalledWith(PrismaQueries.LABEL_ORDER_BY_NAME);
    });

    it('データベースエラー時に適切なエラーレスポンスを返す', async () => {
      mockPrisma.label.findMany.mockRejectedValue(DatabaseErrors.CONNECTION_FAILED);

      const { GET } = require('./route');
      const response = await GET();

      await assertApiResponse(response, HttpStatus.INTERNAL_SERVER_ERROR, ErrorResponses.SERVER_ERROR('ラベルの取得に失敗しました'));
    });

    it('完全なラベルデータ構造を返す', async () => {
      const mockLabel = MockData.label({ id: 1, name: 'Test Label', color: 'blue' });

      mockPrisma.label.findMany.mockResolvedValue([mockLabel]);

      const { GET } = require('./route');
      const response = await GET();

      const data = await assertApiResponse(response, HttpStatus.OK, convertDatesToISOStrings([mockLabel]));
      expect(data).toHaveLength(1);
      expect(data[0]).toHaveProperty('id');
      expect(data[0]).toHaveProperty('name');
      expect(data[0]).toHaveProperty('color');
      expect(data[0]).toHaveProperty('createdAt');
      expect(data[0]).toHaveProperty('updatedAt');
      expect(typeof data[0].id).toBe('number');
      expect(typeof data[0].name).toBe('string');
      expect(typeof data[0].color).toBe('string');
      expect(mockPrisma.label.findMany).toHaveBeenCalledWith(PrismaQueries.LABEL_ORDER_BY_NAME);
    });

    it('ラベルが名前の昇順でソートされることを確認', async () => {
      const mockLabels = [
        MockData.label({ id: 1, name: 'Zebra', color: 'black' }),
        MockData.label({ id: 2, name: 'Alpha', color: 'blue' }),
        MockData.label({ id: 3, name: 'Beta', color: 'green' }),
      ];

      // Prismaは既にソート済みのデータを返すことをシミュレート
      const sortedLabels = [...mockLabels].sort((a, b) => a.name.localeCompare(b.name));
      mockPrisma.label.findMany.mockResolvedValue(sortedLabels);

      const { GET } = require('./route');
      const response = await GET();

      const data = await assertApiResponse(response, HttpStatus.OK, convertDatesToISOStrings(sortedLabels));
      expect(data).toHaveLength(3);
      expect(data[0].name).toBe('Alpha');
      expect(data[1].name).toBe('Beta');
      expect(data[2].name).toBe('Zebra');
      expect(mockPrisma.label.findMany).toHaveBeenCalledWith(PrismaQueries.LABEL_ORDER_BY_NAME);
    });
  });
});
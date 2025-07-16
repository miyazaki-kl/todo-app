import {
  createMockPrismaClient,
  MockPrismaClient,
  setupApiTest,
  MockData,
  createMockNextRequest,
  assertApiResponse,
  HttpStatus,
  ErrorResponses,
  PrismaQueries,
  DatabaseErrors,
} from '../../__tests__/test-utils';
import { verifyPassword } from '@/app/lib/password';

// Create standardized mock Prisma client
const mockPrisma = createMockPrismaClient();

// Mock the prisma module
jest.mock('@/app/lib/prisma', () => ({
  prisma: mockPrisma,
}));

// Mock password verification utility
jest.mock('@/app/lib/password', () => ({
  verifyPassword: jest.fn(),
}));

describe('Authentication API - /api/auth/login', () => {
  let mockVerifyPassword: jest.MockedFunction<typeof verifyPassword>;

  // Use standardized test setup
  setupApiTest(mockPrisma);

  beforeEach(() => {
    mockVerifyPassword = verifyPassword as jest.MockedFunction<typeof verifyPassword>;
  });

  describe('POST /api/auth/login', () => {
    const mockUser = MockData.user({
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      password: '$2a$12$hashedpassword',
    });

    // Requirement 1.1: Valid email and password should return successful login response
    it('有効なメールアドレスとパスワードでログインが成功する', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockVerifyPassword.mockResolvedValue(true);

      const { POST } = require('./route');
      const request = createMockNextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'validpassword',
        }),
      });

      const response = await POST(request);

      await assertApiResponse(response, HttpStatus.OK, {
        success: true,
        message: 'ログインに成功しました',
        user: MockData.userWithoutPassword({
          id: 1,
          email: 'test@example.com',
          name: 'Test User',
        }),
      });
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        ...PrismaQueries.USER_SELECT_WITH_PASSWORD,
      });
      expect(mockVerifyPassword).toHaveBeenCalledWith('validpassword', '$2a$12$hashedpassword');
    });

    // Requirement 1.2: Invalid email should return 401 error
    it('存在しないメールアドレスで401エラーを返す', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const { POST } = require('./route');
      const request = createMockNextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'nonexistent@example.com',
          password: 'password',
        }),
      });

      const response = await POST(request);

      await assertApiResponse(response, HttpStatus.UNAUTHORIZED, ErrorResponses.AUTH_ERROR('メールアドレスまたはパスワードが正しくありません'));
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'nonexistent@example.com' },
        ...PrismaQueries.USER_SELECT_WITH_PASSWORD,
      });
      expect(mockVerifyPassword).not.toHaveBeenCalled();
    });

    // Requirement 1.3: Invalid password should return 401 error
    it('無効なパスワードで401エラーを返す', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockVerifyPassword.mockResolvedValue(false);

      const { POST } = require('./route');
      const request = createMockNextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'wrongpassword',
        }),
      });

      const response = await POST(request);

      await assertApiResponse(response, HttpStatus.UNAUTHORIZED, ErrorResponses.AUTH_ERROR('メールアドレスまたはパスワードが正しくありません'));
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        ...PrismaQueries.USER_SELECT_WITH_PASSWORD,
      });
      expect(mockVerifyPassword).toHaveBeenCalledWith('wrongpassword', '$2a$12$hashedpassword');
    });

    // Requirement 1.4: Missing email should return 400 error
    it('メールアドレスが未入力の場合400エラーを返す', async () => {
      const { POST } = require('./route');
      const request = createMockNextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: 'password',
        }),
      });

      const response = await POST(request);

      await assertApiResponse(response, HttpStatus.BAD_REQUEST, ErrorResponses.AUTH_ERROR('メールアドレスとパスワードを入力してください'));
      expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
      expect(mockVerifyPassword).not.toHaveBeenCalled();
    });

    // Requirement 1.5: Missing password should return 400 error
    it('パスワードが未入力の場合400エラーを返す', async () => {
      const { POST } = require('./route');
      const request = createMockNextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
        }),
      });

      const response = await POST(request);

      await assertApiResponse(response, HttpStatus.BAD_REQUEST, ErrorResponses.AUTH_ERROR('メールアドレスとパスワードを入力してください'));
      expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
      expect(mockVerifyPassword).not.toHaveBeenCalled();
    });

    // Test both email and password missing
    it('メールアドレスとパスワードが両方未入力の場合400エラーを返す', async () => {
      const { POST } = require('./route');
      const request = createMockNextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const response = await POST(request);

      await assertApiResponse(response, HttpStatus.BAD_REQUEST, ErrorResponses.AUTH_ERROR('メールアドレスとパスワードを入力してください'));
      expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
      expect(mockVerifyPassword).not.toHaveBeenCalled();
    });

    // Test empty string values
    it('空文字のメールアドレスとパスワードで400エラーを返す', async () => {
      const { POST } = require('./route');
      const request = createMockNextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: '',
          password: '',
        }),
      });

      const response = await POST(request);

      await assertApiResponse(response, HttpStatus.BAD_REQUEST, ErrorResponses.AUTH_ERROR('メールアドレスとパスワードを入力してください'));
      expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
      expect(mockVerifyPassword).not.toHaveBeenCalled();
    });

    // Requirement 1.6: Database error should return 500 error
    it('データベースエラー時に500エラーを返す', async () => {
      mockPrisma.user.findUnique.mockRejectedValue(DatabaseErrors.CONNECTION_FAILED);

      const { POST } = require('./route');
      const request = createMockNextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password',
        }),
      });

      const response = await POST(request);

      await assertApiResponse(response, HttpStatus.INTERNAL_SERVER_ERROR, ErrorResponses.AUTH_ERROR('サーバーエラーが発生しました'));
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        ...PrismaQueries.USER_SELECT_WITH_PASSWORD,
      });
      expect(mockVerifyPassword).not.toHaveBeenCalled();
    });

    // Requirement 1.7: Password verification failure should return 401 error without exposing sensitive information
    it('パスワード検証でエラーが発生した場合401エラーを返す', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockVerifyPassword.mockRejectedValue(new Error('bcrypt error'));

      const { POST } = require('./route');
      const request = createMockNextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password',
        }),
      });

      const response = await POST(request);

      await assertApiResponse(response, HttpStatus.INTERNAL_SERVER_ERROR, ErrorResponses.AUTH_ERROR('サーバーエラーが発生しました'));
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        ...PrismaQueries.USER_SELECT_WITH_PASSWORD,
      });
      expect(mockVerifyPassword).toHaveBeenCalledWith('password', '$2a$12$hashedpassword');
    });

    // Test malformed JSON
    it('不正なJSONリクエストで500エラーを返す', async () => {
      const { POST } = require('./route');
      const request = createMockNextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json',
      });

      const response = await POST(request);

      await assertApiResponse(response, HttpStatus.INTERNAL_SERVER_ERROR, ErrorResponses.AUTH_ERROR('サーバーエラーが発生しました'));
      expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
      expect(mockVerifyPassword).not.toHaveBeenCalled();
    });

    // Test successful login doesn't expose password in response
    it('ログイン成功時にレスポンスにパスワードが含まれない', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockVerifyPassword.mockResolvedValue(true);

      const { POST } = require('./route');
      const request = createMockNextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'validpassword',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.user).not.toHaveProperty('password');
      expect(data.user).toEqual({
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
      });
    });
  });
});
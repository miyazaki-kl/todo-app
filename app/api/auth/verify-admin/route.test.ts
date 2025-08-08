import { NextRequest } from 'next/server';
import { GET } from './route';
import { verifyToken } from '@/app/lib/jwt';

// JWT関数をモック化
jest.mock('@/app/lib/jwt');
const mockVerifyToken = verifyToken as jest.MockedFunction<typeof verifyToken>;

describe('/api/auth/verify-admin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('認証ヘッダーがない場合は401を返す', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/verify-admin');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('認証トークンが必要です');
    });

    it('Bearer形式でない場合は401を返す', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/verify-admin', {
        headers: {
          authorization: 'Basic token123'
        }
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('認証トークンが必要です');
    });

    it('無効なトークンの場合は401を返す', async () => {
      mockVerifyToken.mockReturnValue(null);

      const request = new NextRequest('http://localhost:3000/api/auth/verify-admin', {
        headers: {
          authorization: 'Bearer invalid-token'
        }
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('無効なトークンです');
    });

    it('管理者権限がない場合は403を返す', async () => {
      mockVerifyToken.mockReturnValue({
        userId: 1,
        email: 'user@example.com',
        isAdmin: false
      });

      const request = new NextRequest('http://localhost:3000/api/auth/verify-admin', {
        headers: {
          authorization: 'Bearer valid-token'
        }
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('管理者権限が必要です');
    });

    it('管理者権限がある場合は成功レスポンスを返す', async () => {
      const mockUserData = {
        userId: 1,
        email: 'admin@example.com',
        isAdmin: true
      };

      mockVerifyToken.mockReturnValue(mockUserData);

      const request = new NextRequest('http://localhost:3000/api/auth/verify-admin', {
        headers: {
          authorization: 'Bearer admin-token'
        }
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.user).toEqual({
        id: mockUserData.userId,
        email: mockUserData.email,
        isAdmin: mockUserData.isAdmin
      });
    });

    it('トークン検証でエラーが発生した場合は500を返す', async () => {
      mockVerifyToken.mockImplementation(() => {
        throw new Error('Token verification error');
      });

      const request = new NextRequest('http://localhost:3000/api/auth/verify-admin', {
        headers: {
          authorization: 'Bearer error-token'
        }
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('認証エラーが発生しました');
    });
  });
});
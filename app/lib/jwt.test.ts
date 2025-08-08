import { generateToken, verifyToken, extractTokenFromHeader } from './jwt';

describe('JWTライブラリ', () => {
  beforeEach(() => {
    // 環境変数の設定（テスト環境では固定シークレットが使用される）
    process.env.NODE_ENV = 'test';
  });

  describe('generateToken', () => {
    test('管理者フラグを含むJWT生成', () => {
      const payload = {
        userId: 1,
        email: 'admin@example.com',
        name: 'Admin User',
        isAdmin: true
      };

      const token = generateToken(payload);
      
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT は header.payload.signature の3部構成
    });

    test('一般ユーザーのJWT生成（isAdminがfalse）', () => {
      const payload = {
        userId: 2,
        email: 'user@example.com',
        name: 'Regular User',
        isAdmin: false
      };

      const token = generateToken(payload);
      
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    test('isAdminフィールドが未定義の場合のJWT生成', () => {
      const payload = {
        userId: 3,
        email: 'nonadmin@example.com',
        name: 'Non Admin User'
        // isAdmin フィールドなし
      };

      const token = generateToken(payload);
      
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });
  });

  describe('verifyToken', () => {
    test('管理者フラグを含むJWT検証', () => {
      const payload = {
        userId: 1,
        email: 'admin@example.com',
        name: 'Admin User',
        isAdmin: true
      };

      const token = generateToken(payload);
      const decoded = verifyToken(token);

      expect(decoded.userId).toBe(1);
      expect(decoded.email).toBe('admin@example.com');
      expect(decoded.name).toBe('Admin User');
      expect(decoded.isAdmin).toBe(true);
      expect(typeof decoded.iat).toBe('number');
      expect(typeof decoded.exp).toBe('number');
    });

    test('一般ユーザーのJWT検証（isAdminがfalse）', () => {
      const payload = {
        userId: 2,
        email: 'user@example.com',
        name: 'Regular User',
        isAdmin: false
      };

      const token = generateToken(payload);
      const decoded = verifyToken(token);

      expect(decoded.userId).toBe(2);
      expect(decoded.email).toBe('user@example.com');
      expect(decoded.name).toBe('Regular User');
      expect(decoded.isAdmin).toBe(false);
    });

    test('isAdminフィールドが未定義の場合のJWT検証', () => {
      const payload = {
        userId: 3,
        email: 'nonadmin@example.com',
        name: 'Non Admin User'
        // isAdmin フィールドなし
      };

      const token = generateToken(payload);
      const decoded = verifyToken(token);

      expect(decoded.userId).toBe(3);
      expect(decoded.email).toBe('nonadmin@example.com');
      expect(decoded.name).toBe('Non Admin User');
      expect(decoded.isAdmin).toBeUndefined();
    });

    test('無効なトークンでのエラー', () => {
      const invalidToken = 'invalid.token.here';
      
      expect(() => {
        verifyToken(invalidToken);
      }).toThrow('無効なトークンです');
    });

    test('トークン形式が正しくない場合のエラー', () => {
      const malformedToken = 'not-a-jwt-token';
      
      expect(() => {
        verifyToken(malformedToken);
      }).toThrow();
    });
  });

  describe('extractTokenFromHeader', () => {
    test('Bearer形式からのトークン抽出', () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.signature';
      const authHeader = `Bearer ${token}`;
      
      const extracted = extractTokenFromHeader(authHeader);
      
      expect(extracted).toBe(token);
    });

    test('Authorizationヘッダーがない場合', () => {
      const extracted = extractTokenFromHeader(null);
      
      expect(extracted).toBeNull();
    });

    test('Bearer形式でない場合', () => {
      const authHeader = 'Basic dXNlcjpwYXNz'; // Basic認証形式
      
      const extracted = extractTokenFromHeader(authHeader);
      
      expect(extracted).toBeNull();
    });

    test('Bearer の後にトークンがない場合', () => {
      const authHeader = 'Bearer';
      
      const extracted = extractTokenFromHeader(authHeader);
      
      expect(extracted).toBeNull();
    });

    test('空のAuthorizationヘッダー', () => {
      const extracted = extractTokenFromHeader('');
      
      expect(extracted).toBeNull();
    });
  });

  describe('JWT統合テスト', () => {
    test('管理者ユーザーの完全なJWTフロー', () => {
      // 管理者ユーザーでトークン生成
      const adminPayload = {
        userId: 1,
        email: 'admin@example.com',
        name: 'Admin User',
        isAdmin: true
      };

      const token = generateToken(adminPayload);
      const authHeader = `Bearer ${token}`;
      
      // ヘッダーからトークン抽出
      const extractedToken = extractTokenFromHeader(authHeader);
      expect(extractedToken).toBe(token);
      
      // トークン検証
      const decoded = verifyToken(extractedToken!);
      expect(decoded.userId).toBe(adminPayload.userId);
      expect(decoded.email).toBe(adminPayload.email);
      expect(decoded.name).toBe(adminPayload.name);
      expect(decoded.isAdmin).toBe(adminPayload.isAdmin);
    });

    test('一般ユーザーの完全なJWTフロー', () => {
      // 一般ユーザーでトークン生成
      const userPayload = {
        userId: 2,
        email: 'user@example.com',
        name: 'Regular User',
        isAdmin: false
      };

      const token = generateToken(userPayload);
      const authHeader = `Bearer ${token}`;
      
      // ヘッダーからトークン抽出
      const extractedToken = extractTokenFromHeader(authHeader);
      expect(extractedToken).toBe(token);
      
      // トークン検証
      const decoded = verifyToken(extractedToken!);
      expect(decoded.userId).toBe(userPayload.userId);
      expect(decoded.email).toBe(userPayload.email);
      expect(decoded.name).toBe(userPayload.name);
      expect(decoded.isAdmin).toBe(userPayload.isAdmin);
    });
  });
});
import jwt from 'jsonwebtoken';

const JWT_SECRET = (() => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    // テスト環境では固定シークレットを使用
    if (process.env.NODE_ENV === 'test') {
      return 'test-jwt-secret-for-unit-tests-only';
    }
    throw new Error('JWT_SECRET environment variable is required but not set');
  }
  return secret;
})();
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface TokenPayload {
  userId: number;
  email: string;
  name: string | null;
  isAdmin?: boolean;
}

export interface DecodedToken extends TokenPayload {
  iat: number;
  exp: number;
}

/**
 * JWTトークンを生成する
 * @param payload - トークンに含めるユーザー情報
 * @returns 生成されたJWTトークン
 */
export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET as jwt.Secret, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

/**
 * JWTトークンを検証してデコードする
 * @param token - 検証するJWTトークン
 * @returns デコードされたトークン情報
 * @throws トークンが無効な場合はエラーをスロー
 */
export function verifyToken(token: string): DecodedToken {
  try {
    const decoded = jwt.verify(token, JWT_SECRET as jwt.Secret) as DecodedToken;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('トークンの有効期限が切れています');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('無効なトークンです');
    } else {
      throw new Error('トークンの検証に失敗しました');
    }
  }
}

/**
 * Authorizationヘッダーからトークンを抽出する
 * @param authHeader - Authorizationヘッダーの値
 * @returns 抽出されたトークン、またはnull
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) return null;
  
  // Bearer <token> 形式からトークンを抽出
  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0] === 'Bearer') {
    return parts[1];
  }
  
  return null;
}
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader, DecodedToken } from './jwt';

/**
 * 管理者認証が必要なAPIルートで使用するミドルウェア関数
 * JWTトークンを検証し、管理者権限があることを確認する
 * @param handler - 認証・権限確認後に実行するハンドラー関数
 * @returns ミドルウェアでラップされたハンドラー
 */
export function withAdmin<T extends any[], R>(
  handler: (request: NextRequest, user: DecodedToken, ...args: T) => Promise<R>
) {
  return async (request: NextRequest, ...args: T): Promise<R | NextResponse> => {
    try {
      // Authorizationヘッダーからトークンを取得
      const authHeader = request.headers.get('authorization');
      const token = extractTokenFromHeader(authHeader);

      // デバッグ用ログ
      if (process.env.NODE_ENV === 'development') {
        const url = new URL(request.url);
        console.log('管理者認証チェック:', {
          hasToken: !!token,
          url: request.url,
          pathname: url.pathname
        });
      }

      if (!token) {
        return NextResponse.json(
          { error: '認証が必要です' },
          { status: 401 }
        );
      }

      // トークンを検証
      const decoded = verifyToken(token);

      // 管理者権限をチェック
      if (!decoded.isAdmin) {
        if (process.env.NODE_ENV === 'development') {
          console.log('管理者権限なしでアクセス試行:', {
            userId: decoded.userId,
            email: decoded.email,
            isAdmin: decoded.isAdmin
          });
        }
        
        return NextResponse.json(
          { error: 'この操作には管理者権限が必要です' },
          { status: 403 }
        );
      }

      // 認証・権限確認成功時はハンドラーを実行
      if (process.env.NODE_ENV === 'development') {
        console.log('管理者認証成功:', {
          userId: decoded.userId,
          email: decoded.email
        });
      }

      return handler(request, decoded, ...args);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.log('管理者認証エラー:', error);
      }
      
      return NextResponse.json(
        { error: '認証トークンが無効です' },
        { status: 401 }
      );
    }
  };
}

/**
 * 管理者権限エラーレスポンスを生成する
 * @param message - エラーメッセージ
 * @param status - HTTPステータスコード（デフォルト: 403）
 * @returns エラーレスポンス
 */
export function createAdminErrorResponse(
  message: string = 'この操作には管理者権限が必要です',
  status: number = 403
): NextResponse {
  return NextResponse.json(
    { error: message },
    { status }
  );
}
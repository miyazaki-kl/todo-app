import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader, DecodedToken } from './jwt';

export interface AuthenticatedRequest extends NextRequest {
  user?: DecodedToken;
}

/**
 * API認証ミドルウェア
 * JWTトークンを検証し、有効な場合はユーザー情報をリクエストに追加する
 * @param request - 認証チェックを行うリクエスト
 * @returns 認証結果とユーザー情報
 */
export async function authenticateRequest(
  request: NextRequest
): Promise<{ authenticated: boolean; user?: DecodedToken; error?: string }> {
  try {
    // Authorizationヘッダーからトークンを取得
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);

    // デバッグ用ログ
    console.log('認証チェック:', {
      hasAuthHeader: !!authHeader,
      authHeaderStart: authHeader?.substring(0, 20) + '...',
      hasToken: !!token,
      tokenStart: token?.substring(0, 20) + '...',
      url: request.url
    });

    if (!token) {
      return {
        authenticated: false,
        error: '認証トークンが見つかりません',
      };
    }

    // トークンを検証
    const decoded = verifyToken(token);

    return {
      authenticated: true,
      user: decoded,
    };
  } catch (error) {
    console.log('認証エラー:', error);
    return {
      authenticated: false,
      error: error instanceof Error ? error.message : '認証に失敗しました',
    };
  }
}

/**
 * 認証が必要なAPIルートで使用するミドルウェア関数
 * @param handler - 認証後に実行するハンドラー関数
 * @returns ミドルウェアでラップされたハンドラー
 */
export function withAuth<T extends any[], R>(
  handler: (request: NextRequest, user: DecodedToken, ...args: T) => Promise<R>
) {
  return async (request: NextRequest, ...args: T): Promise<R | NextResponse> => {
    const { authenticated, user, error } = await authenticateRequest(request);

    if (!authenticated) {
      return NextResponse.json(
        { 
          success: false, 
          message: error || '認証が必要です' 
        },
        { status: 401 }
      );
    }

    // 認証成功時はハンドラーを実行
    return handler(request, user!, ...args);
  };
}

/**
 * 認証エラーレスポンスを生成する
 * @param message - エラーメッセージ
 * @param status - HTTPステータスコード（デフォルト: 401）
 * @returns エラーレスポンス
 */
export function createAuthErrorResponse(
  message: string = '認証が必要です',
  status: number = 401
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status }
  );
}
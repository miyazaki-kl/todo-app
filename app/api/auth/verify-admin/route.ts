import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/app/lib/jwt';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '認証トークンが必要です' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { error: '無効なトークンです' },
        { status: 401 }
      );
    }

    if (!decoded.isAdmin) {
      return NextResponse.json(
        { error: '管理者権限が必要です' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: decoded.userId,
        email: decoded.email,
        isAdmin: decoded.isAdmin
      }
    });

  } catch (error) {
    console.error('管理者権限確認エラー:', error);
    return NextResponse.json(
      { error: '認証エラーが発生しました' },
      { status: 500 }
    );
  }
}
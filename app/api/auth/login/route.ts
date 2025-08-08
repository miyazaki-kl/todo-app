import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { verifyPassword } from '@/app/lib/password';
import { generateToken } from '@/app/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (process.env.NODE_ENV === 'development') {
      console.log('ログイン試行:', { email, password: '***' });
    }

    // 入力値検証
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: 'メールアドレスとパスワードを入力してください',
        },
        { status: 400 }
      );
    }

    // データベースからユーザーを検索
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
      },
    });

    // ユーザーが存在しない場合
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'メールアドレスまたはパスワードが正しくありません',
        },
        { status: 401 }
      );
    }

    // パスワード検証（bcryptハッシュ比較）
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          message: 'メールアドレスまたはパスワードが正しくありません',
        },
        { status: 401 }
      );
    }

    // JWTトークンを生成
    const token = generateToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    // 認証成功
    if (process.env.NODE_ENV === 'development') {
      console.log('ログイン成功:', { userId: user.id, email: user.email });
    }
    
    return NextResponse.json(
      {
        success: true,
        message: 'ログインに成功しました',
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('ログインAPIエラー:', error);
    }
    return NextResponse.json(
      {
        success: false,
        message: 'サーバーエラーが発生しました',
      },
      { status: 500 }
    );
  }
}
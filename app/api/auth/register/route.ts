import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { hashPassword } from '@/app/lib/password';
import { validatePassword } from '@/app/lib/password-validation';
import { withAdmin } from '@/app/lib/admin-middleware';
import { DecodedToken } from '@/app/lib/jwt';

interface RegisterRequestBody {
  email: string;
  name: string;
  password: string;
  isAdmin?: boolean;
}

/**
 * POST /api/auth/register
 * 管理者による新規ユーザー登録API
 * 管理者権限が必要
 */
export const POST = withAdmin(async (request: NextRequest, user: DecodedToken) => {
  try {
    const body: RegisterRequestBody = await request.json();
    const { email, name, password, isAdmin = false } = body;

    if (process.env.NODE_ENV === 'development') {
      console.log('ユーザー登録試行:', { 
        requestedBy: user.email,
        newUserEmail: email,
        newUserName: name,
        newUserIsAdmin: isAdmin 
      });
    }

    // 必須フィールドのバリデーション
    if (!email || !name || !password) {
      return NextResponse.json(
        {
          success: false,
          message: 'メールアドレス、名前、パスワードは必須です',
        },
        { status: 400 }
      );
    }

    // メールアドレス形式の簡単なバリデーション
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          message: '有効なメールアドレスを入力してください',
        },
        { status: 400 }
      );
    }

    // パスワードバリデーション
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        {
          success: false,
          message: passwordValidation.errors[0] || 'パスワードが無効です',
        },
        { status: 400 }
      );
    }

    // メールアドレスの重複チェック
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: 'このメールアドレスは既に使用されています',
        },
        { status: 400 }
      );
    }

    // パスワードをハッシュ化
    const hashedPassword = await hashPassword(password);

    // 新規ユーザーを作成
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        isAdmin: !!isAdmin, // 明示的にbooleanに変換
      },
    });

    if (process.env.NODE_ENV === 'development') {
      console.log('ユーザー登録成功:', {
        createdBy: user.email,
        newUserId: newUser.id,
        newUserEmail: newUser.email,
        newUserIsAdmin: newUser.isAdmin
      });
    }

    // レスポンス（パスワードは除外）
    return NextResponse.json(
      {
        success: true,
        message: 'ユーザーが正常に作成されました',
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          isAdmin: newUser.isAdmin,
        },
      },
      { status: 201 }
    );

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('ユーザー登録API エラー:', error);
    }

    return NextResponse.json(
      {
        success: false,
        message: 'サーバーエラーが発生しました',
      },
      { status: 500 }
    );
  }
});
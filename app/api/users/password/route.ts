import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { verifyPassword, hashPassword } from '@/app/lib/password';
import { validatePassword } from '@/app/lib/password-validation';
import { withAuth } from '@/app/lib/auth-middleware';

export const PUT = withAuth(async (request: NextRequest, user) => {
  try {
    const body = await request.json();
    const { userId, currentPassword, newPassword } = body;

    // 入力値検証
    if (!userId || !currentPassword || !newPassword) {
      return NextResponse.json(
        {
          success: false,
          message: 'ユーザーID、現在のパスワード、新しいパスワードを入力してください',
        },
        { status: 400 }
      );
    }

    // パスワード強度チェック
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        {
          success: false,
          message: passwordValidation.errors[0] || 'パスワードの形式が正しくありません',
        },
        { status: 400 }
      );
    }

    // 現在のパスワードと新しいパスワードが同じかチェック
    if (currentPassword === newPassword) {
      return NextResponse.json(
        {
          success: false,
          message: '現在のパスワードと新しいパスワードが同じです',
        },
        { status: 400 }
      );
    }

    // データベースからユーザーを取得
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        password: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'ユーザーが見つかりません',
        },
        { status: 404 }
      );
    }

    // 現在のパスワードを検証
    const isCurrentPasswordValid = await verifyPassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          message: '現在のパスワードが正しくありません',
        },
        { status: 401 }
      );
    }

    // 新しいパスワードをハッシュ化
    const hashedNewPassword = await hashPassword(newPassword);

    // データベースのパスワードを更新
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    console.log('パスワード変更成功:', { userId, email: user.email });

    return NextResponse.json(
      {
        success: true,
        message: 'パスワードが正常に変更されました',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('パスワード変更APIエラー:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'サーバーエラーが発生しました',
      },
      { status: 500 }
    );
  }
})
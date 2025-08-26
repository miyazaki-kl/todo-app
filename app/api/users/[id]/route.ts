import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { withAdminAuth } from '@/app/lib/auth-middleware';

// DELETE /api/users/[id] - ユーザーを削除（管理者権限必要）
export const DELETE = withAdminAuth(async (_request: NextRequest, user, context) => {
  try {
    const { params } = context as { params: Promise<{ id: string }> };
    const { id } = await params;
    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      return NextResponse.json({ error: '無効なユーザーIDです' }, { status: 400 });
    }

    // 削除対象ユーザーを取得
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'ユーザーが見つかりません' }, { status: 404 });
    }

    // 管理者ユーザーの削除を防止
    if (targetUser.isAdmin) {
      return NextResponse.json(
        { error: '管理者ユーザーは削除できません' },
        { status: 400 }
      );
    }

    // 削除実行者が自分自身を削除することを防止
    if (targetUser.id === user.userId) {
      return NextResponse.json(
        { error: '自分自身は削除できません' },
        { status: 400 }
      );
    }

    // トランザクションで関連データと一緒に削除
    await prisma.$transaction(async (tx) => {
      // ユーザーが担当していたTodoのuserIdをnullに設定
      await tx.todo.updateMany({
        where: { userId: userId },
        data: { userId: null },
      });

      // ユーザーを削除
      await tx.user.delete({
        where: { id: userId },
      });
    });

    return NextResponse.json({
      success: true,
      message: `ユーザー「${targetUser.name}」を削除しました`,
    });
  } catch (error) {
    console.error('ユーザー削除エラー:', error);
    return NextResponse.json(
      { error: 'ユーザーの削除に失敗しました' },
      { status: 500 }
    );
  }
});
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { withAuth } from '@/app/lib/auth-middleware';

// GET /api/users - すべてのユーザーを取得（担当者選択用）
export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
        createdAt: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: 'ユーザーの取得に失敗しました' }, { status: 500 });
  }
})
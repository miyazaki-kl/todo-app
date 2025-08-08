import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

// GET /api/users - すべてのユーザーを取得（担当者選択用）
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: 'ユーザーの取得に失敗しました' }, { status: 500 });
  }
}
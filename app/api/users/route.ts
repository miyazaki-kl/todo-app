import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;
if ((global as any).prisma) {
  prisma = (global as any).prisma;
} else {
  prisma = new PrismaClient();
  if (process.env.NODE_ENV === 'test') {
    (global as any).prisma = prisma;
  }
}

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
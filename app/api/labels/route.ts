import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { withAuth } from '@/app/lib/auth-middleware';

// GET /api/labels - すべてのラベルを取得
export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    const labels = await prisma.label.findMany({
      orderBy: {
        name: 'asc',
      },
    });
    return NextResponse.json(labels);
  } catch (error) {
    return NextResponse.json({ error: 'ラベルの取得に失敗しました' }, { status: 500 });
  }
})
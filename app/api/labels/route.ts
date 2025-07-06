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

// GET /api/labels - すべてのラベルを取得
export async function GET() {
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
}
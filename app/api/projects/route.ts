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

// GET /api/projects - すべてのプロジェクトを取得
export async function GET(request: Request) {
  try {
    const projects = await prisma.project.findMany({
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            todos: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json({ error: 'プロジェクトの取得に失敗しました' }, { status: 500 });
  }
}

// POST /api/projects - 新しいプロジェクトを作成
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, color, createdById } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'プロジェクト名は必須です' },
        { status: 400 }
      );
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        color: color || 'blue',
        createdById,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            todos: true,
          },
        },
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'プロジェクトの作成に失敗しました' },
      { status: 500 }
    );
  }
}
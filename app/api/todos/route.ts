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

// GET /api/todos - すべてのTodoを取得
export async function GET() {
  try {
    const todos = await prisma.todo.findMany({
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(todos);
  } catch (error) {
    return NextResponse.json({ error: 'Todoの取得に失敗しました' }, { status: 500 });
  }
}

// POST /api/todos - 新しいTodoを作成
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, createdById, assignedToId } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'タイトルは必須です' },
        { status: 400 }
      );
    }

    const todo = await prisma.todo.create({
      data: {
        title,
        description,
        createdById,
        assignedToId,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(todo, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Todoの作成に失敗しました' },
      { status: 500 }
    );
  }
} 
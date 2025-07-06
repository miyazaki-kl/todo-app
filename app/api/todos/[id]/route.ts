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

// GET /api/todos/[id] - 指定されたTodoを取得
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: '無効なIDです' }, { status: 400 });
    }

    const todo = await prisma.todo.findUnique({
      where: { id },
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
        labels: {
          include: {
            label: true,
          },
        },
      },
    });

    if (!todo) {
      return NextResponse.json(
        { error: '指定されたTodoが見つかりません' },
        { status: 404 }
      );
    }

    return NextResponse.json(todo);
  } catch (error) {
    return NextResponse.json(
      { error: 'Todoの取得に失敗しました' },
      { status: 500 }
    );
  }
}

// PUT /api/todos/[id] - 指定されたTodoを更新
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: '無効なIDです' }, { status: 400 });
    }

    const body = await request.json();
    const { title, description, completed, assignedToId, labelIds } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'タイトルは必須です' },
        { status: 400 }
      );
    }

    // 既存のラベル関連付けを削除してから新しく作成
    await prisma.todoLabel.deleteMany({
      where: { todoId: id },
    });

    const todo = await prisma.todo.update({
      where: { id },
      data: {
        title,
        description,
        completed,
        assignedToId,
        labels: labelIds && labelIds.length > 0 ? {
          create: labelIds.map((labelId: number) => ({
            labelId,
          })),
        } : undefined,
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
        labels: {
          include: {
            label: true,
          },
        },
      },
    });

    return NextResponse.json(todo);
  } catch (error: any) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json(
        { error: '指定されたTodoが見つかりません' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Todoの更新に失敗しました' },
      { status: 500 }
    );
  }
}

// DELETE /api/todos/[id] - 指定されたTodoを削除
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: '無効なIDです' }, { status: 400 });
    }

    const todo = await prisma.todo.delete({
      where: { id },
    });

    return NextResponse.json(todo);
  } catch (error: any) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json(
        { error: '指定されたTodoが見つかりません' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Todoの削除に失敗しました' },
      { status: 500 }
    );
  }
} 
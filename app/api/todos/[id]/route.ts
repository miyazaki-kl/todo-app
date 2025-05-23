import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PUT /api/todos/[id] - 指定されたTodoを更新
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { title, description, completed } = body;

    if (isNaN(id)) {
      return NextResponse.json(
        { error: '無効なIDです' },
        { status: 400 }
      );
    }

    if (!title) {
      return NextResponse.json(
        { error: 'タイトルは必須です' },
        { status: 400 }
      );
    }

    const todo = await prisma.todo.update({
      where: {
        id: id,
      },
      data: {
        title,
        description,
        completed: completed ?? false,
      },
    });

    return NextResponse.json(todo);
  } catch (error) {
    if (error.code === 'P2025') {
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
      return NextResponse.json(
        { error: '無効なIDです' },
        { status: 400 }
      );
    }

    const todo = await prisma.todo.delete({
      where: {
        id: id,
      },
    });

    return NextResponse.json(todo);
  } catch (error) {
    if (error.code === 'P2025') {
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
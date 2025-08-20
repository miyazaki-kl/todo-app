import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { withAuth } from '@/app/lib/auth-middleware';

// GET /api/todos/[id] - 指定されたTodoを取得
export const GET = withAuth(async (
  request: NextRequest,
  user,
  { params }: { params: { id: string } }
) => {
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
        project: {
          select: {
            id: true,
            name: true,
            description: true,
            color: true,
            createdBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
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
})

// PUT /api/todos/[id] - 指定されたTodoを更新
export const PUT = withAuth(async (
  request: NextRequest,
  user,
  { params }: { params: { id: string } }
) => {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: '無効なIDです' }, { status: 400 });
    }

    const body = await request.json();
    const { title, description, completed, assignedToId, projectId, labelIds, dueDate } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'タイトルは必須です' },
        { status: 400 }
      );
    }

    // 現在のTodoの状態を取得して完了状態の変更を検知
    const currentTodo = await prisma.todo.findUnique({
      where: { id },
      select: { completed: true }
    });

    if (!currentTodo) {
      return NextResponse.json(
        { error: '指定されたTodoが見つかりません' },
        { status: 404 }
      );
    }

    // completedAt の自動設定ロジック
    let completedAt: Date | null = null;
    if (completed && !currentTodo.completed) {
      // 未完了から完了に変更された場合、現在時刻を設定
      completedAt = new Date();
    } else if (!completed && currentTodo.completed) {
      // 完了から未完了に変更された場合、nullに設定
      completedAt = null;
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
        dueDate: dueDate ? new Date(dueDate) : null,
        ...(completedAt !== null || (!completed && currentTodo.completed) ? { completedAt } : {}),
        assignedToId,
        projectId,
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
        project: {
          select: {
            id: true,
            name: true,
            description: true,
            color: true,
            createdBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
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
})

// DELETE /api/todos/[id] - 指定されたTodoを削除
export const DELETE = withAuth(async (
  request: NextRequest,
  user,
  { params }: { params: { id: string } }
) => {
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
}) 
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { withAuth } from '@/app/lib/auth-middleware';

// GET /api/todos - すべてのTodoを取得
export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    const { searchParams } = new URL(request.url);
    const currentUserId = searchParams.get('currentUserId');
    const projectId = searchParams.get('projectId');
    const assignedToId = searchParams.get('assignedToId');
    const createdById = searchParams.get('createdById');
    let whereCondition: any = {};
    
    if (projectId) {
      whereCondition.projectId = parseInt(projectId);
    }
    
    if (assignedToId) {
      whereCondition.assignedToId = parseInt(assignedToId);
    }
    
    if (createdById) {
      whereCondition.createdById = parseInt(createdById);
    }

    const todos = await prisma.todo.findMany({
      where: whereCondition,
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    // currentUserIdが指定されている場合、そのユーザーが担当のタスクを上位に移動
    if (currentUserId) {
      const userIdNum = parseInt(currentUserId);
      const assignedTodos = todos.filter(todo => todo.assignedToId === userIdNum);
      const otherTodos = todos.filter(todo => todo.assignedToId !== userIdNum);
      
      return NextResponse.json([...assignedTodos, ...otherTodos]);
    }

    return NextResponse.json(todos);
  } catch (error) {
    return NextResponse.json({ error: 'Todoの取得に失敗しました' }, { status: 500 });
  }
})

// POST /api/todos - 新しいTodoを作成
export const POST = withAuth(async (request: NextRequest, user) => {
  try {
    const body = await request.json();
    const { title, description, createdById, assignedToId, projectId, labelIds } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'タイトルは必須です' },
        { status: 400 }
      );
    }

    if (!projectId) {
      return NextResponse.json(
        { error: 'プロジェクトIDは必須です' },
        { status: 400 }
      );
    }

    const todo = await prisma.todo.create({
      data: {
        title,
        description,
        createdById,
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

    return NextResponse.json(todo, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Todoの作成に失敗しました' },
      { status: 500 }
    );
  }
}) 
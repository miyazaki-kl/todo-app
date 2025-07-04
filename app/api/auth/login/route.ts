import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Mock API - どんな入力でも成功を返す
    console.log('ログイン試行:', { email, password });

    // 実際の認証処理はここで行う（今回はMock）
    // 何も入力がなくても成功を返す
    return NextResponse.json(
      {
        success: true,
        message: 'ログインに成功しました',
        user: {
          id: 1,
          email: email || 'demo@example.com',
          name: 'デモユーザー',
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('ログインAPIエラー:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'ログインに失敗しました',
      },
      { status: 500 }
    );
  }
}
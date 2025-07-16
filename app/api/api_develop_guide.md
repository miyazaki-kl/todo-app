# API開発ガイド

## 概要
このガイドでは、Next.jsのAPI RouteとJestを使ったテストの実装手順を説明します。

## 必要なパッケージ
- `next`
- `@prisma/client`
- `jest`
- `@types/jest`
- `ts-jest`

## テストユーティリティの使用
このプロジェクトでは、一貫したテストパターンを実現するために標準化されたテストユーティリティを使用します。

### テストユーティリティの場所
```
app/api/__tests__/test-utils.ts
```

### 基本的な使用方法
```typescript
import {
  createMockPrismaClient,
  setupApiTest,
  MockData,
  convertDatesToISOStrings,
  assertApiResponse,
  HttpStatus,
  ErrorResponses,
  PrismaQueries,
  DatabaseErrors,
} from '../__tests__/test-utils';

// 標準化されたモックPrismaクライアントを作成
const mockPrisma = createMockPrismaClient();

// グローバルprismaをモックに設定
(global as any).prisma = mockPrisma;

describe('API Test', () => {
  // 標準化されたテストセットアップを使用
  setupApiTest(mockPrisma);
  
  it('should work', async () => {
    // モックデータファクトリーを使用
    const mockTodo = MockData.todo({ title: 'Test Todo' });
    mockPrisma.todo.findMany.mockResolvedValue([mockTodo]);
    
    const { GET } = require('./route');
    const response = await GET();
    
    // 標準化されたレスポンス検証を使用
    await assertApiResponse(response, HttpStatus.OK, convertDatesToISOStrings([mockTodo]));
    expect(mockPrisma.todo.findMany).toHaveBeenCalledWith(PrismaQueries.TODO_INCLUDE_RELATIONS);
  });
});
```

## 型定義の共有
フロントエンドとバックエンドで型を共有することで、型の一貫性を保ち、開発効率を向上させることができます。

### 1. 型定義ファイルの配置
```
app/
├── types/
│   └── todo.ts  # 共通の型定義
```

### 2. 型定義の実装例
```typescript
// app/types/todo.ts
export interface Todo {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### 3. 型の使用例
```typescript
// フロントエンド（app/page.tsx）
import { Todo } from './types/todo';

const [todos, setTodos] = useState<Todo[]>([]);

// バックエンド（app/api/todos/route.ts）
import { Todo } from '../../types/todo';

const todos: Todo[] = await prisma.todo.findMany();
```

### 4. メリット
- フロントエンドとバックエンドで型の一貫性が保証される
- 型の不一致によるバグを防ぐ
- コード補完が効く
- リファクタリングが容易
- バグの早期発見

## 実装手順

### 1. API Routeの実装
`app/api/todos/route.ts`および`app/api/todos/[id]/route.ts`では、**PrismaClientインスタンスの生成方法をグローバル変数参照パターンに統一**してください。これにより、テスト時に`global.prisma`をモックに差し替えることで、API実装側でも必ずモックが利用されるようになります。

```typescript
// PrismaClientインスタンスの生成（route.ts, [id]/route.ts 共通パターン）
let prisma: PrismaClient;
if ((global as any).prisma) {
  prisma = (global as any).prisma;
} else {
  prisma = new PrismaClient();
  if (process.env.NODE_ENV === 'test') {
    (global as any).prisma = prisma;
  }
}
```

> **LLMへの注意**
> - PrismaClientのインスタンス生成は必ず上記のグローバル変数参照パターンで統一してください。
> - ファイル先頭で`const prisma = new PrismaClient();`のように即時生成すると、テスト時にモックが反映されません。
> - テスト時は`jest.resetModules()`と`global.prisma`の差し替えを必ず行い、`require`でAPI実装を都度読み直してください。

### 2. テストの実装（推奨：標準化されたテストユーティリティを使用）
`app/api/todos/route.test.ts`に以下のコードを実装します。

```typescript
import {
  createMockPrismaClient,
  setupApiTest,
  MockData,
  convertDatesToISOStrings,
  assertApiResponse,
  HttpStatus,
  ErrorResponses,
  PrismaQueries,
  DatabaseErrors,
} from '../__tests__/test-utils';

// 標準化されたモックPrismaクライアントを作成
const mockPrisma = createMockPrismaClient();

// グローバルprismaをモックに設定
(global as any).prisma = mockPrisma;

describe('Todo API', () => {
  // 標準化されたテストセットアップを使用
  setupApiTest(mockPrisma);

  describe('GET /api/todos', () => {
    it('すべてのTodoを取得できる', async () => {
      const mockDbTodos = [
        MockData.todo({ 
          id: 1, 
          title: 'テスト1', 
          description: '説明1', 
          completed: false,
          createdBy: MockData.userWithoutPassword({ id: 1, name: 'User 1', email: 'user1@example.com' }),
          assignedTo: null,
          labels: []
        }),
        MockData.todo({ 
          id: 2, 
          title: 'テスト2', 
          description: '説明2', 
          completed: true,
          createdBy: MockData.userWithoutPassword({ id: 2, name: 'User 2', email: 'user2@example.com' }),
          assignedTo: MockData.userWithoutPassword({ id: 1, name: 'User 1', email: 'user1@example.com' }),
          labels: []
        }),
      ];

      mockPrisma.todo.findMany.mockResolvedValue(mockDbTodos);

      const { GET } = require('./route');
      const request = new Request('http://localhost:3000/api/todos');
      const response = await GET(request);

      await assertApiResponse(response, HttpStatus.OK, convertDatesToISOStrings(mockDbTodos));
      expect(mockPrisma.todo.findMany).toHaveBeenCalledWith(PrismaQueries.TODO_INCLUDE_RELATIONS);
    });

    it('エラー時に適切なエラーレスポンスを返す', async () => {
      (prisma.todo.findMany as jest.Mock).mockRejectedValue(new Error('DBエラー'));
      const { GET } = require('./route');
      const response = await GET();
      const data = await response.json();

      expect(response.constructor.name).toBe('NextResponse');
      expect(data).toEqual({ error: 'Todoの取得に失敗しました' });
      expect(response.status).toBe(500);
    });
  });

  describe('POST /api/todos', () => {
    it('新しいTodoを作成できる', async () => {
      const now = new Date();
      const mockTodo = {
        id: 1,
        title: '新しいTodo',
        description: '説明',
        completed: false,
        createdAt: now,
        updatedAt: now,
      };

      (prisma.todo.create as jest.Mock).mockResolvedValue(mockTodo);

      const { POST } = require('./route');
      const request = new Request('http://localhost:3000/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '新しいTodo',
          description: '説明',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.constructor.name).toBe('NextResponse');
      expect(data).toEqual({
        ...mockTodo,
        createdAt: mockTodo.createdAt.toISOString(),
        updatedAt: mockTodo.updatedAt.toISOString(),
      });
      expect(response.status).toBe(201);
      expect(prisma.todo.create).toHaveBeenCalledWith({
        data: {
          title: '新しいTodo',
          description: '説明',
        },
      });
    });

    it('タイトルが未指定の場合はエラーを返す', async () => {
      const { POST } = require('./route');
      const request = new Request('http://localhost:3000/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: '説明',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.constructor.name).toBe('NextResponse');
      expect(data).toEqual({ error: 'タイトルは必須です' });
      expect(response.status).toBe(400);
    });

    it('エラー時に適切なエラーレスポンスを返す', async () => {
      (prisma.todo.create as jest.Mock).mockRejectedValue(new Error('DBエラー'));
      const { POST } = require('./route');
      const request = new Request('http://localhost:3000/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '新しいTodo',
          description: '説明',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.constructor.name).toBe('NextResponse');
      expect(data).toEqual({ error: 'Todoの作成に失敗しました' });
      expect(response.status).toBe(500);
    });
  });
});

### 3. 特定のIDに対するAPI Routeの実装
`app/api/todos/[id]/route.ts`に以下のコードを実装します。

```typescript
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

// PUT /api/todos/[id] - 特定のTodoを更新
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: '無効なIDです' }, { status: 400 });
    }

    const body = await request.json();
    const { title, description, completed } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'タイトルは必須です' },
        { status: 400 }
      );
    }

    const todo = await prisma.todo.update({
      where: { id },
      data: {
        title,
        description,
        completed,
      },
    });

    return NextResponse.json(todo);
  } catch (error: any) {
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

// DELETE /api/todos/[id] - 特定のTodoを削除
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
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

### 4. 特定のIDに対するテストの実装
`app/api/todos/id/route.test.ts`に以下のコードを実装します。

```typescript
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// PrismaClientのモック
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    todo: {
      update: jest.fn(),
      delete: jest.fn(),
    },
  })),
}));

describe('Todo API (特定のID)', () => {
  let prisma: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    jest.resetModules();
    prisma = new PrismaClient() as jest.Mocked<PrismaClient>;
    (global as any).prisma = prisma;
  });

  describe('PUT /api/todos/[id]', () => {
    it('Todoを更新できる', async () => {
      const now = new Date();
      const mockTodo = {
        id: 1,
        title: '更新されたTodo',
        description: '更新された説明',
        completed: true,
        createdAt: now,
        updatedAt: now,
      };

      (prisma.todo.update as jest.Mock).mockResolvedValue(mockTodo);

      const { PUT } = require('./route');
      const request = new Request('http://localhost:3000/api/todos/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '更新されたTodo',
          description: '更新された説明',
          completed: true,
        }),
      });

      const response = await PUT(request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.constructor.name).toBe('NextResponse');
      expect(data).toEqual({
        ...mockTodo,
        createdAt: mockTodo.createdAt.toISOString(),
        updatedAt: mockTodo.updatedAt.toISOString(),
      });
      expect(prisma.todo.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          title: '更新されたTodo',
          description: '更新された説明',
          completed: true,
        },
      });
    });

    it('タイトルが未指定の場合はエラーを返す', async () => {
      const { PUT } = require('./route');
      const request = new Request('http://localhost:3000/api/todos/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: '更新された説明',
        }),
      });

      const response = await PUT(request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.constructor.name).toBe('NextResponse');
      expect(data).toEqual({ error: 'タイトルは必須です' });
      expect(response.status).toBe(400);
    });

    it('無効なIDの場合はエラーを返す', async () => {
      const { PUT } = require('./route');
      const request = new Request('http://localhost:3000/api/todos/invalid', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '更新されたTodo',
        }),
      });

      const response = await PUT(request, { params: { id: 'invalid' } });
      const data = await response.json();

      expect(response.constructor.name).toBe('NextResponse');
      expect(data).toEqual({ error: '無効なIDです' });
      expect(response.status).toBe(400);
    });

    it('存在しないTodoの場合はエラーを返す', async () => {
      (prisma.todo.update as jest.Mock).mockRejectedValue({ code: 'P2025' });

      const { PUT } = require('./route');
      const request = new Request('http://localhost:3000/api/todos/999', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '更新されたTodo',
        }),
      });

      const response = await PUT(request, { params: { id: '999' } });
      const data = await response.json();

      expect(response.constructor.name).toBe('NextResponse');
      expect(data).toEqual({ error: '指定されたTodoが見つかりません' });
      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/todos/[id]', () => {
    it('Todoを削除できる', async () => {
      const now = new Date();
      const mockTodo = {
        id: 1,
        title: '削除されるTodo',
        description: '説明',
        completed: false,
        createdAt: now,
        updatedAt: now,
      };

      (prisma.todo.delete as jest.Mock).mockResolvedValue(mockTodo);

      const { DELETE } = require('./route');
      const request = new Request('http://localhost:3000/api/todos/1', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.constructor.name).toBe('NextResponse');
      expect(data).toEqual({
        ...mockTodo,
        createdAt: mockTodo.createdAt.toISOString(),
        updatedAt: mockTodo.updatedAt.toISOString(),
      });
      expect(prisma.todo.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('無効なIDの場合はエラーを返す', async () => {
      const { DELETE } = require('./route');
      const request = new Request('http://localhost:3000/api/todos/invalid', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { id: 'invalid' } });
      const data = await response.json();

      expect(response.constructor.name).toBe('NextResponse');
      expect(data).toEqual({ error: '無効なIDです' });
      expect(response.status).toBe(400);
    });

    it('存在しないTodoの場合はエラーを返す', async () => {
      (prisma.todo.delete as jest.Mock).mockRejectedValue({ code: 'P2025' });

      const { DELETE } = require('./route');
      const request = new Request('http://localhost:3000/api/todos/999', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { id: '999' } });
      const data = await response.json();

      expect(response.constructor.name).toBe('NextResponse');
      expect(data).toEqual({ error: '指定されたTodoが見つかりません' });
      expect(response.status).toBe(404);
    });
  });
});

### 5. Jestの設定
`jest.config.js`に以下の設定を追加します。

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
};
```

### 6. テストの実行
以下のコマンドでテストを実行します。

```bash
# すべてのTodoを取得・作成するAPIのテスト
npx jest app/api/todos/route.test.ts

# 特定のIDに対するTodoの更新・削除APIのテスト
npx jest app/api/todos/id/route.test.ts
```

## 注意点
- テスト時は`global`オブジェクトを使ってPrismaClientのインスタンスを差し替えています。
- `NextResponse`の`instanceof`チェックは`constructor.name`で行っています。
- 日付型の比較は`toISOString()`を使って文字列化して行っています。
- 動的ルート（`[id]`）のテストファイルは、Jestの設定で正しく認識されるように、ディレクトリ名を`id`のように変更します。

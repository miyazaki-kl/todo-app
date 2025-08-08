# プロジェクト構造詳細

## ディレクトリ構成
```
todo-app/
├── app/                        # Next.js App Router
│   ├── api/                   # API Routes
│   │   ├── __tests__/        # APIテストユーティリティ
│   │   ├── auth/             # 認証API（ログイン）
│   │   ├── users/            # ユーザー管理API
│   │   ├── todos/            # Todo CRUD API
│   │   ├── labels/           # ラベル管理API
│   │   └── projects/         # プロジェクト管理API
│   ├── components/           # Reactコンポーネント
│   │   ├── LabelBadge.tsx   # ラベル表示
│   │   ├── LabelSelector.tsx # ラベル選択
│   │   └── TodoForm.tsx     # Todo入力フォーム
│   ├── lib/                  # ユーティリティ
│   │   ├── prisma.ts        # Prismaクライアント
│   │   └── auth.ts          # パスワード処理
│   ├── types/               # TypeScript型定義
│   │   └── todo.ts          # Todo関連の型
│   ├── login/               # ログインページ
│   ├── profile/             # プロフィール設定
│   └── todos/[id]/          # Todo詳細ページ
├── prisma/
│   ├── schema.prisma        # データベーススキーマ
│   ├── migrations/          # マイグレーションファイル
│   └── seed.ts             # シードデータ
├── scripts/                 # 実行スクリプト
│   ├── migrate.sh          # 本番マイグレーション
│   └── migrate-dev.sh      # 開発マイグレーション
├── .serena/                # Serena設定
├── docker-compose.yml      # Docker Compose設定
├── Dockerfile             # Dockerイメージ定義
├── package.json           # npm依存関係
├── tsconfig.json          # TypeScript設定
├── jest.config.js         # Jest設定
├── tailwind.config.ts     # Tailwind CSS設定
├── CLAUDE.md             # LLM開発ガイド
├── TEST.md               # テスト実行ガイド
└── README.md             # プロジェクト説明
```

## データベースモデル
- **User**: ユーザー情報（認証含む）
- **Todo**: Todoアイテム
- **Label**: ラベル（6色定義済み）
- **Project**: プロジェクト分類
- **TodoLabel**: Todo-Label中間テーブル

## API構成
- RESTful設計
- Next.js API Routes使用
- Prisma ORMでデータベース操作
- bcryptjsで認証処理

## フロントエンド構成
- Next.js 14 App Router
- React 18 Server Components
- Tailwind CSSでスタイリング
- TypeScript型安全性確保
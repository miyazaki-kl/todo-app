# Todo App

## 📌 概要

このプロジェクトは、**LLM（大規模言語モデル）によって完全に記述されたテストプロジェクト**です。Next.jsとPrismaを使用したTodoアプリケーションの開発を通じて、LLMの開発能力を検証しています。

現在は基本的なTodo管理機能を実装し、以下の特徴があります：

* カラーコード化されたラベルシステム
* 多対多関係によるマルチラベル対応
* 包括的なAPIテスト
* Docker環境での開発

## 🔧 使用技術

* **フロントエンド**: Next.js 14 + TypeScript + React 18 + Tailwind CSS
* **バックエンド**: Next.js API Routes
* **データベース**: PostgreSQL + Prisma ORM
* **テスト**: Jest + TypeScript
* **コンテナ化**: Docker + Docker Compose
* **開発環境**: Docker完全対応

## 🐳 開発環境

### 前提条件
- Docker
- Docker Compose

### セットアップ
```bash
# リポジトリをクローン
git clone https://github.com/miyazaki-kl/todo-app.git
cd todo-app

# Docker環境でアプリケーションを起動
docker compose up -d

# データベースマイグレーション実行
docker compose exec app npm run db:migrate:dev
```

### 開発コマンド
```bash
# アプリケーション起動
docker compose up -d

# アプリケーション停止（データベースリセット）
docker compose down -v

# リント実行
docker compose exec app npm run lint

# テスト実行
docker compose exec app npm test

# データベース管理
docker compose exec app npm run db:studio
```

**重要**: すべてのnpmコマンドは`docker compose exec app`プレフィックスを付けてDockerコンテナ内で実行してください。

## 🎯 LLMテストプロジェクトの目的

このプロジェクトは以下の検証を目的としています：

* **コード品質**: LLMが生成する実装の品質と保守性
* **テストカバレッジ**: 包括的なテストスイートの自動生成
* **アーキテクチャ設計**: 拡張可能で保守しやすい設計の実現
* **開発効率**: 従来の開発プロセスとの比較検証
* **ドキュメント**: 自動生成されるドキュメントの品質

## 🧱 実装済み機能

### ✅ 基本Todo機能
* [x] Todo作成・編集・削除
* [x] Todo一覧表示
* [x] 完了状態の切り替え
* [x] 作成日時による並び替え

### ✅ ラベルシステム
* [x] 6色のカラーコード化ラベル（緊急、重要、進行中、レビュー、完了予定、参考）
* [x] マルチラベル対応（1つのTodoに複数ラベル）
* [x] ラベルによるフィルタリング
* [x] 視覚的なバッジ表示

### ✅ API・データベース
* [x] RESTful API設計
* [x] Prisma ORM使用
* [x] PostgreSQL対応
* [x] 多対多関係実装
* [x] エラーハンドリング

### ✅ ユーザー認証
* [x] ログイン機能（bcrypt使用）
* [x] ログアウト機能（localStorage管理）
* [x] パスワード変更機能
* [x] パスワード強度チェック
* [x] ユーザー情報管理
* [x] 認証状態管理

### ✅ テスト
* [x] Jest設定
* [x] API単体テスト
* [x] モックデータ生成
* [x] テストユーティリティ
* [x] CI/CD対応

### ✅ 開発環境
* [x] Docker完全対応
* [x] ホットリロード
* [x] TypeScript strict mode
* [x] ESLint設定
* [x] パスエイリアス

## 📊 プロジェクト構造

```
├── app/
│   ├── api/                    # API Routes
│   │   ├── __tests__/         # テストユーティリティ
│   │   ├── auth/              # 認証API（ログイン）
│   │   ├── users/             # ユーザー管理API
│   │   ├── todos/             # Todo API
│   │   └── labels/            # ラベル API
│   ├── components/            # React コンポーネント
│   ├── lib/                   # ユーティリティ（パスワード処理含む）
│   ├── types/                 # TypeScript型定義
│   ├── login/                 # ログインページ
│   ├── profile/               # プロフィール設定ページ
│   └── todos/[id]/           # 動的ルーティング
├── prisma/
│   ├── schema.prisma         # データベーススキーマ
│   └── migrations/           # マイグレーション
├── scripts/                  # 実行スクリプト
├── CLAUDE.md                 # LLM開発ガイド
├── TEST.md                   # テスト実行ガイド
└── docker-compose.yml        # Docker設定
```

## 🔍 データベーススキーマ

```prisma
model User {
  id            Int      @id @default(autoincrement())
  email         String   @unique
  name          String?
  password      String
  todos         Todo[]
  createdTodos  Todo[]   @relation("TodoCreatedBy")
  assignedTodos Todo[]   @relation("TodoAssignedTo")
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Todo {
  id          Int      @id @default(autoincrement())
  title       String
  description String?
  completed   Boolean  @default(false)
  labels      Label[]  @relation("TodoLabels")
  createdBy   User?    @relation("TodoCreatedBy", fields: [createdById], references: [id])
  createdById Int?
  assignedTo  User?    @relation("TodoAssignedTo", fields: [assignedToId], references: [id])
  assignedToId Int?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Label {
  id    Int     @id @default(autoincrement())
  name  String  @unique
  color String
  todos Todo[]  @relation("TodoLabels")
}
```

## 🚀 今後の拡張予定

### 📋 ユーザー管理
* [ ] ユーザー登録機能
* [ ] サーバーサイドセッション管理
* [ ] 認証ミドルウェア
* [ ] JWTトークン認証

### 📊 拡張機能
* [ ] 作業履歴カレンダー
* [ ] プロジェクト管理
* [ ] 統計・レポート機能
* [ ] CSV/JSONエクスポート

### 🔐 セキュリティ
* [ ] 認証・認可
* [ ] CSRF対策
* [ ] XSS対策

## 📖 ドキュメント

* [CLAUDE.md](./CLAUDE.md) - LLM開発ガイド
* [TEST.md](./TEST.md) - テスト実行ガイド
* [app/api/api_develop_guide.md](./app/api/api_develop_guide.md) - API開発ガイド

## 🤝 貢献

このプロジェクトはLLMの開発能力検証を目的としています。フィードバックや改善提案は Issue や Pull Request でお願いします。

## 📄 ライセンス

MIT License
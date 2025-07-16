# CLAUDE.md

このファイルは、このリポジトリでのコード作業時にClaude Code (claude.ai/code)にガイダンスを提供します。

## 開発コマンド

### 基本コマンド
- `docker compose up -d` - Docker Composeでアプリケーションを開始
- `docker compose down -v` - ボリュームを含めてコンテナを停止・削除（データベースリセット）
- `docker compose up -d --force-recreate` - コンテナとボリュームを強制再作成
- `docker compose exec app npm run lint` - ESLintを実行
- `docker compose exec app npm test` - Jestテストを実行

### 重要：開発環境
- **開発時は必ずDocker Composeを使用** - `docker compose up -d`
- **ローカルnpmコマンドは絶対に使用しない** (`npm run dev`, `npm run build`, `npm run start`)
- **すべてのnpmコマンドはDockerコンテナ内で実行** - `docker compose exec app npm run [コマンド]`
- このプロジェクトはDockerコンテナでのみ動作するよう設定
- ローカル開発環境のセットアップは非対応、避けること

### Gitワークフロー（重要）
- **作業開始前の必須手順**:
  1. `git checkout main` - mainブランチに切り替え
  2. `git pull origin main` - 最新のmainブランチを取得
  3. `git checkout -b feature/your-feature-name` - 新しいブランチを作成
- **絶対に既存ブランチで作業しない** - 常に最新のmainから新しいブランチを切る
- **PRマージ後は必ず新しいブランチで次の作業を開始する**

### PR管理（重要）
- **PRに変更を追加する前の必須確認**:
  1. `gh pr view <PR番号>` - PRのステータスを確認
  2. **マージ済みの場合**: 新しいブランチを作成して新しいPRを作成
  3. **オープン中の場合**: 既存のPRに変更を追加可能
- **マージ済みPRには絶対に変更を追加しない**
- **追加変更が必要な場合は必ず新しいPRを作成する**

### データベースコマンド
- `docker compose exec app npm run db:migrate` - データベースマイグレーション実行（本番環境）
- `docker compose exec app npm run db:migrate:dev` - マイグレーション実行（開発環境）
- `docker compose exec app npm run db:studio` - Prisma Studioでデータベース確認

### 追加スクリプト
- `./scripts/migrate-dev.sh` - 開発用マイグレーションスクリプト
- `./scripts/migrate.sh` - 本番用マイグレーションスクリプト

### テストコマンド
- `docker compose exec app npm test` - 全てのテストを実行
- `docker compose exec app npx jest [ファイルパス]` - 特定のファイルのみテスト実行
- `docker compose exec app npm run test:watch` - テストをウォッチモードで実行

## アーキテクチャ

### 技術スタック
- **フロントエンド**: Next.js 14 with TypeScript, React 18, Tailwind CSS
- **バックエンド**: Next.js API Routes
- **データベース**: PostgreSQL with Prisma ORM
- **テスト**: Jest with TypeScript support
- **コンテナ化**: Docker with Docker Compose

### プロジェクト構造
```
app/
├── api/todos/           # Todo API エンドポイント
├── components/          # React コンポーネント
├── lib/                 # ユーティリティライブラリ（Prismaクライアント）
├── todos/[id]/         # 動的Todo詳細ページ
├── types/              # TypeScript型定義
├── globals.css         # グローバルスタイル
├── layout.tsx          # ルートレイアウト
└── page.tsx            # ホームページ

prisma/
├── schema.prisma       # データベーススキーマ
└── migrations/         # データベースマイグレーション
```

### データベーススキーマ
- **User**: id, email, name, todos (リレーション), timestamps
- **Todo**: id, title, description, completed, user リレーション (オプション), labels (リレーション), timestamps
- **Label**: id, name, color, todos (リレーション), timestamps
- **TodoLabel**: Todo と Label の多対多リレーション

### 主要ファイル
- `app/types/todo.ts` - Todo と Label の TypeScript インターフェース
- `app/components/LabelBadge.tsx` - 色分けされたラベル表示コンポーネント
- `app/components/LabelSelector.tsx` - 複数選択ラベルピッカーコンポーネント
- `app/lib/prisma.ts` - Prisma クライアント設定
- `prisma/schema.prisma` - データベーススキーマ定義
- `jest.config.js` - Jest テスト設定

### API エンドポイント
- `GET /api/todos` - ラベル付きTodo一覧取得（作成日降順）
- `POST /api/todos` - ラベル割り当て付きTodo新規作成
- `GET /api/todos/[id]` - ラベル付き特定Todo取得
- `PUT /api/todos/[id]` - ラベル再割り当て付きTodo更新
- `GET /api/labels` - 利用可能なラベル一覧取得
- その他のCRUD操作は各ルートファイルで実装

### テスト
- Jest でTypeScriptサポート設定済み
- テストファイル: `**/*.test.ts` と `**/*.test.tsx`
- パスマッピング: `@/*` → プロジェクトルートに解決

### ラベルシステム
- **カラーコード化ラベル**: 6つの定義済みラベル（赤、オレンジ、青、紫、緑、灰色）
- **マルチラベル対応**: 各Todoは複数のラベルを持つことが可能
- **定義済みラベル**: 緊急（赤）、重要（オレンジ）、進行中（青）、レビュー（紫）、完了予定（緑）、参考（灰色）
- **視覚的表示**: Todo一覧と詳細ビューでカラーコード化バッジ表示
- **ラベル管理**: フォームでのチェックボックス型複数選択インターフェース

### 開発ノート
- PostgreSQL をメインデータベースとして使用
- Prisma でデータベーススキーマとマイグレーションを管理
- テスト環境対応のグローバルPrismaクライアント
- Next.js App Router アーキテクチャ
- TypeScript strict mode 有効
- パスエイリアス設定（`@/*` → `./`）
- Todo と Label の多対多関係によるラベルシステム

### テスト要件
- 実装完了後は必ず TEST.md に従って MCP tools でテストを実行すること
- MCP Playwright を使用してE2Eテストを実行
- パスワードハッシュ化機能の動作確認を含む完全なログインフローテスト
- 詳細なテスト手順は TEST.md を参照

### 言語サポート
- 主要言語: 日本語（コメントとエラーメッセージ）
- UI とドキュメント: 日本語

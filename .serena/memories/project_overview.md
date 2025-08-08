# プロジェクト概要

## プロジェクトの目的
LLM（大規模言語モデル）によって完全に記述されたテストプロジェクト。Next.jsとPrismaを使用したTodoアプリケーションの開発を通じて、LLMの開発能力を検証。

## 技術スタック
- **フロントエンド**: Next.js 14 + TypeScript + React 18 + Tailwind CSS
- **バックエンド**: Next.js API Routes
- **データベース**: PostgreSQL + Prisma ORM  
- **テスト**: Jest + TypeScript
- **コンテナ化**: Docker + Docker Compose
- **認証**: bcryptjs によるパスワードハッシュ化

## 主要機能
1. **Todo管理**: CRUD操作、完了状態管理
2. **ラベルシステム**: 6色のカラーコード化ラベル、マルチラベル対応
3. **ユーザー認証**: ログイン/ログアウト、パスワード管理
4. **プロジェクト管理**: Todoのプロジェクト分類機能

## アーキテクチャ
- Next.js App Router使用
- Prisma ORMによるデータベース操作
- Docker環境での開発（ローカル開発非対応）
- TypeScript strict mode有効
- パスエイリアス設定（`@/*` → `./`）
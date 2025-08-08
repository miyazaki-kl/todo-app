# コードスタイルと規約

## TypeScript設定
- **strict mode**: 有効
- **target**: ES5
- **module**: ESNext
- **パスエイリアス**: `@/*` → `./`

## ファイル構造規約
```
app/
├── api/                    # API Routes（各エンドポイント）
│   ├── __tests__/         # テストユーティリティ
│   └── [resource]/        # リソース別ディレクトリ
├── components/            # React コンポーネント
├── lib/                   # ユーティリティ（Prismaクライアント等）
├── types/                 # TypeScript型定義
└── [route]/              # ページルート
```

## 命名規則
- **コンポーネント**: PascalCase（例: `LabelBadge.tsx`）
- **ユーティリティ**: camelCase（例: `hashPassword.ts`）
- **API Routes**: kebab-case ディレクトリ（例: `api/todos/`）
- **型定義**: PascalCase（例: `TodoWithLabels`）

## React/Next.js規約
- App Router使用
- Server Components優先
- Client Componentsは`'use client'`明示
- API RoutesでRESTful設計

## Prisma規約
- モデル名: PascalCase単数形
- フィールド名: camelCase
- リレーション名: 複数形または意味的な名前
- `@relation`で明示的な関係定義

## テスト規約
- テストファイル: `*.test.ts` または `*.test.tsx`
- モックデータ: `__tests__/utils/`に配置
- Jestでの単体テスト

## コメント・ドキュメント
- 主要言語: 日本語（コメントとエラーメッセージ）
- UI とドキュメント: 日本語
- 必要最小限のコメント（コードで意図を表現）

## ESLint設定
- Next.js Core Web Vitals準拠
- `next lint`でチェック

## 重要な注意
- **絵文字は使用しない**（ユーザーが明示的に要求した場合のみ）
- **既存ファイルの編集を優先**（新規ファイル作成は最小限）
- **既存のコード規約に従う**（周辺コードのスタイルを確認）
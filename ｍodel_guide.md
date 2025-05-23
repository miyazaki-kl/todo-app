# Prismaでテーブルを追加する手順

## 1. スキーマの修正
`prisma/schema.prisma`ファイルを開き、新しいモデルを追加します。  
例: Userテーブルを追加する場合

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  todos     Todo[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## 2. マイグレーションの作成
以下のコマンドを実行して、マイグレーションファイルを生成します。

```bash
npx prisma migrate dev --name add_user_table
```

## 3. マイグレーションの適用
生成されたマイグレーションファイルを確認し、問題なければ自動的に適用されます。  
（`prisma migrate dev`コマンドは、マイグレーションの作成と適用を同時に行います）

## 4. Prismaクライアントの更新
マイグレーション適用後、Prismaクライアントを更新します。

```bash
npx prisma generate
```

## 5. 動作確認
アプリケーションを再起動し、新しいテーブルが正しく動作することを確認します。

## 注意点
- マイグレーション実行前に、必ずスキーマの変更内容を確認してください。
- 本番環境では`prisma migrate deploy`を使用して、既存のマイグレーションを適用します。
- スキーマ変更後は、関連するAPIやテストも更新が必要です。

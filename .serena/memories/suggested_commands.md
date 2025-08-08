# 開発コマンド一覧

## Docker環境（必須使用）
```bash
# アプリケーション起動
docker compose up -d

# アプリケーション停止（データベースリセット）
docker compose down -v

# コンテナとボリュームを強制再作成
docker compose up -d --force-recreate
```

## npm コマンド（全てDockerコンテナ内で実行）
```bash
# リント実行
docker compose exec app npm run lint

# テスト実行
docker compose exec app npm test

# 特定ファイルのテスト
docker compose exec app npx jest [ファイルパス]

# テストをウォッチモードで実行
docker compose exec app npm run test:watch
```

## データベース管理
```bash
# 開発環境マイグレーション
docker compose exec app npm run db:migrate:dev

# 本番環境マイグレーション  
docker compose exec app npm run db:migrate

# Prisma Studio起動
docker compose exec app npm run db:studio
```

## スクリプト
```bash
# 開発用マイグレーションスクリプト
./scripts/migrate-dev.sh

# 本番用マイグレーションスクリプト
./scripts/migrate.sh
```

## Git ワークフロー
```bash
# 作業開始前（必須）
git checkout main
git pull origin main
git checkout -b feature/your-feature-name

# PR作成
gh pr create --title "タイトル" --body "説明"

# PRステータス確認
gh pr view <PR番号>
```

## システムコマンド（Darwin）
- ls, cd, grep, find は標準的なUnixコマンドと同様
- ripgrep（rg）がインストール済み
- gh コマンドでGitHub操作可能

## 重要な注意事項
- **絶対にローカルnpmコマンドは使用しない**
- **すべてのnpmコマンドは`docker compose exec app`プレフィックスを付ける**
- **既存ブランチで作業しない - 常に最新mainから新規ブランチ作成**
- **マージ済みPRには変更を追加しない**
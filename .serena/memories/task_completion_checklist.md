# タスク完了時のチェックリスト

## 必須実行項目

### 1. コード品質チェック
```bash
# ESLintでコード品質確認
docker compose exec app npm run lint
```

### 2. テスト実行
```bash
# 全テスト実行
docker compose exec app npm test

# 関連ファイルのテスト実行
docker compose exec app npx jest [変更したファイルのテスト]
```

### 3. TypeScriptチェック
- TypeScript strict modeでのエラーがないことを確認
- 型定義が適切であることを確認

### 4. Dockerコンテナ確認
```bash
# コンテナが正常動作していることを確認
docker compose ps

# ログ確認（エラーがないか）
docker compose logs app
```

### 5. データベース関連（該当する場合）
```bash
# スキーマ変更がある場合はマイグレーション実行
docker compose exec app npm run db:migrate:dev
```

### 6. E2Eテスト（必要に応じて）
- TEST.md に従ってMCP Playwrightでテスト実行
- 特にユーザー認証機能に関わる変更の場合は必須

## 推奨確認事項

### コードレビュー観点
- 既存のコード規約に従っているか
- 不要なコメントや絵文字が含まれていないか
- エラーハンドリングが適切か
- セキュリティ上の問題がないか（特にパスワード、認証関連）

### Git操作前の確認
- 正しいブランチで作業しているか
- mainブランチから最新を取得しているか
- コミットメッセージが適切か

## 注意事項
- **lint/typecheckコマンドが不明な場合**: ユーザーに確認し、CLAUDE.mdに記録
- **テストが失敗した場合**: 必ず修正してから完了とする
- **Docker環境外でのコマンド実行は禁止**
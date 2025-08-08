# ローカルCI実行手順書

このドキュメントは、todo-appプロジェクトのローカルCI実行手順のガイドです。

## 目的

- プルリクエスト作成前に、ローカル環境で自動テストを実行し品質を担保する
- Docker Compose環境での単体テストとMCP Playwrightによる統合テストを実施する

## 実行手順

### 1. 環境の準備

```bash
# 既存環境の確認と終了
docker compose ps
docker compose down -v

# アプリケーション環境の起動
docker compose up -d

# 環境の起動確認
docker compose ps

# スクリーンショット保存用のディレクトリを作成
SCREENSHOT_DIR="./screenshots/$(date '+%Y%m%d_%H%M%S')"
mkdir -p $SCREENSHOT_DIR
echo "スクリーンショットは ${SCREENSHOT_DIR} に保存されます"
```

### 2. 依存関係の確認とテスト実行

```bash
# Lintチェック
docker compose exec app npm run lint

# 型チェック
docker compose exec app npx tsc --noEmit

# Jest単体テスト
docker compose exec app npm test

# Next.jsビルド確認
docker compose exec app npm run build
```

### 3. MCP Playwrightテスト

```bash
# TEST.mdの手順に従ってE2Eテストを実行
# 各画面遷移後にスクリーンショットを保存
# 1. ブラウザ起動とページ表示
#    - ログイン画面のスクリーンショット保存
# 2. ログインテスト
#    - ログイン後のホーム画面のスクリーンショット保存
# 3. Todo機能テスト
#    - Todo作成フォームのスクリーンショット保存
#    - Todo一覧のスクリーンショット保存
#    - Todo詳細のスクリーンショット保存
# 4. パスワード変更テスト
#    - プロフィール画面のスクリーンショット保存
#    - パスワード変更フォームのスクリーンショット保存
# など

# スクリーンショット保存時の注意点
# - ファイル名は「画面名_YYYYMMDD_HHMMSS.png」の形式
# - MCPは一時フォルダにスクリーンショットを保存するため、テスト終了後に移動が必要
# - 一時フォルダ: /var/folders/*/T/playwright-mcp-output/*/
```

### 4. スクリーンショットの移動

```bash
# MCPの一時フォルダからスクリーンショットを移動
MCP_DIR="/var/folders/*/T/playwright-mcp-output/*/"
cp $MCP_DIR/ss-* $SCREENSHOT_DIR/

# スクリーンショットの保存確認
ls -l $SCREENSHOT_DIR
```

### 5. 環境の終了

```bash
# アプリケーション環境の停止
docker compose down
```

## 注意事項

- **必ずDocker Compose環境で実行してください**
- ローカルでの直接的なnpmコマンド実行は避けてください
- MCP Playwrightテストは `TEST.md` の手順に厳密に従ってください
- テスト実行中はアプリケーションにアクセスしないでください
- スクリーンショットは `./screenshots` 配下に保存され、`.gitignore` 対象です
- 各画面遷移後に必ずスクリーンショットを保存してください
- **スクリーンショットはテスト終了後に一時フォルダから移動する必要があります**

## テスト実行チェックリスト

- [ ] Docker Compose環境が正常に起動している
- [ ] ESLintエラーがない
- [ ] TypeScript型エラーがない
- [ ] Jestテストが全て成功
- [ ] Next.jsビルドが成功
- [ ] MCP Playwrightテストが全て成功
- [ ] 全画面のスクリーンショットが保存されている
- [ ] スクリーンショットが正しく移動されている
- [ ] 環境の終了時にエラーが発生していない

## トラブルシューティング

### よくある問題と解決策

1. **Docker環境の起動に失敗する場合**
   ```bash
   docker compose down -v
   docker compose up -d
   ```

2. **テストが失敗する場合**
   - ログを確認し、エラー内容を特定
   - 必要に応じてデータベースをリセット
   - `TEST.md` の手順を再確認
   - スクリーンショットを確認して問題箇所を特定

3. **ブラウザテストが失敗する場合**
   - アプリケーションが `http://localhost:3000` で正常に動作していることを確認
   - MCP Playwrightの手順を最初から実行し直す
   - エラー発生時のスクリーンショットを確認

4. **スクリーンショットの保存に失敗する場合**
   - `./screenshots` ディレクトリの権限を確認
   - ディスク容量を確認
   - 一時的に別のディレクトリに保存してみる

## 参考

- `TEST.md`: E2Eテスト手順の詳細
- `CLAUDE.md`: 開発環境とコマンドの説明
- [Playwright テストガイド](https://playwright.dev/docs/intro)
- [Playwright スクリーンショットガイド](https://playwright.dev/docs/screenshots)

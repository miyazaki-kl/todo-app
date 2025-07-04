# テスト手順書

このファイルは、パスワードハッシュ化実装後のE2Eテスト手順をMCP Playwrightで実行するためのガイドです。

## テスト対象

### パスワードハッシュ化機能
- ✅ bcryptjsを使用したパスワードハッシュ化（12 salt rounds）
- ✅ 認証API でのハッシュ検証
- ✅ シードスクリプトでのハッシュ化パスワード保存

### ログイン機能
- ✅ admin@example.com / admin
- ✅ test@example.com / test123
- ✅ ログイン後のユーザー情報表示
- ✅ ログアウト機能

## 前提条件

### Docker環境
```bash
# データベース完全リセット
docker compose down
docker volume prune -f  # 全ボリューム削除

# アプリケーション再起動
docker compose up -d
```

### 依存関係確認
- bcryptjs: パスワードハッシュ化
- @types/bcryptjs: TypeScript型定義
- MCP Playwright: E2Eテスト実行

## MCP Playwright E2Eテスト手順

### 1. 初期確認
```bash
# Docker コンテナ状況確認
docker compose ps

# アプリケーション URL: http://localhost:3000
```

### 2. MCP Playwright テスト実行

#### ステップ1: ブラウザ起動
- **ツール**: `mcp__playwright__browser_navigate`
- **URL**: `http://localhost:3000`
- **期待結果**: ログイン画面が表示される

#### ステップ2: ページスナップショット
- **ツール**: `mcp__playwright__browser_snapshot`
- **目的**: ログイン画面の確認

#### ステップ3: Adminユーザーログインテスト
1. **メールアドレス入力**
   - **ツール**: `mcp__playwright__browser_type`
   - **要素**: email入力フィールド
   - **値**: `admin@example.com`

2. **パスワード入力**
   - **ツール**: `mcp__playwright__browser_type`
   - **要素**: password入力フィールド
   - **値**: `admin`

3. **ログインボタンクリック**
   - **ツール**: `mcp__playwright__browser_click`
   - **要素**: ログインボタン

4. **ログイン成功確認**
   - **期待結果**: メインページにリダイレクト
   - **確認項目**: ヘッダーに「ログイン中: 管理者 (admin@example.com)」表示

#### ステップ4: ログアウト
- **ツール**: `mcp__playwright__browser_click`
- **要素**: ログアウトボタン
- **期待結果**: ログイン画面に戻る

#### ステップ5: テストユーザーログインテスト
1. **メールアドレス入力**: `test@example.com`
2. **パスワード入力**: `test123`
3. **ログイン実行**
4. **期待結果**: 「ログイン中: テストユーザー (test@example.com)」表示

#### ステップ6: Todo機能動作確認
1. **新規Todo作成**
   - タイトル: "テスト用Todo"
   - 説明: "パスワードハッシュ化テスト"

2. **Todo一覧表示確認**
3. **Todo削除確認**

#### ステップ7: 無効なログインテスト
1. **無効なパスワードでログイン試行**
   - メール: `admin@example.com`
   - パスワード: `wrongpassword`
   - **期待結果**: エラーメッセージ表示

2. **存在しないユーザーでログイン試行**
   - メール: `nonexistent@example.com`
   - パスワード: `password`
   - **期待結果**: エラーメッセージ表示

## データベース検証

### パスワードハッシュ化確認
```bash
# Docker PostgreSQL接続
docker compose exec db psql -U postgres -d todo_app

# ユーザーテーブル確認
SELECT id, email, name, LEFT(password, 10) as password_hash FROM "User";

# 期待結果: passwordカラムが$2a$12$で始まるハッシュ値
```

## 検証チェックリスト

### 機能テスト
- [ ] Docker環境でのアプリケーション起動
- [ ] ハッシュ化パスワードでのDB保存確認
- [ ] adminユーザーログイン成功
- [ ] testユーザーログイン成功
- [ ] ログイン後ヘッダーにユーザー情報表示
- [ ] Todo作成・削除機能動作
- [ ] ログアウト機能動作
- [ ] 無効なパスワードでのログイン拒否
- [ ] 存在しないユーザーでのログイン拒否

### セキュリティテスト
- [ ] パスワードが平文でログに出力されない
- [ ] データベースにハッシュ化パスワードが保存
- [ ] bcrypt検証での適切なタイミング攻撃対策

### パフォーマンステスト
- [ ] ログイン処理が2秒以内に完了
- [ ] パスワードハッシュ化が適切な時間で完了

## トラブルシューティング

### よくある問題

#### 1. bcryptjsモジュールエラー
```bash
# 解決策: Docker再ビルド
docker compose down
docker compose build --no-cache
docker compose up -d
```

#### 2. データベース接続エラー
```bash
# 解決策: ボリューム削除して再作成
docker volume prune -f
docker compose up -d
```

#### 3. ログインエラー
- **原因**: 古い平文パスワードが残っている
- **解決策**: データベース完全リセット

## 次回実行時の注意点

1. **データベース状態確認**: 必ずハッシュ化パスワードが保存されていることを確認
2. **Docker環境**: 依存関係の更新でコンテナ再ビルドが必要
3. **テストデータ**: admin/testユーザーのパスワードは変更しない
4. **MCP Playwright**: スナップショット機能で画面確認を併用

## 成功基準

全ての検証チェックリストが ✅ になり、MCP PlaywrightでのE2Eテストが正常に完了すること。
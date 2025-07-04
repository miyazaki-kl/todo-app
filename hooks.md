# Hooks

Hooksは、Claude Codeの動作をカスタマイズするための仕組みです。特定のイベントに応答してシェルコマンドを実行できます。

## 設定方法

Hooksは設定ファイルで定義します。以下のイベントに対してコマンドを設定できます：

- `PreToolUse` - ツール呼び出し前に実行（実行をブロック可能）
- `PostToolUse` - ツール呼び出し後に実行
- `Notification` - システム通知発生時に実行
- `Stop` - メインエージェントの作業完了時に実行
- `SubagentStop` - サブエージェントの作業完了時に実行

## 設定構造

Hooksは以下のJSON構造で設定します：

```json
{
  "hooks": {
    "EventName": [
      {
        "matcher": "ToolPattern",
        "hooks": [
          {
            "type": "command",
            "command": "your-command-here"
          }
        ]
      }
    ]
  }
}
```

## 使用例

### ツール呼び出し前の処理
特定のツール使用前にチェックを実行：
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit",
        "hooks": [
          {
            "type": "command",
            "command": "echo 'About to edit file'"
          }
        ]
      }
    ]
  }
}
```

### ツール呼び出し後の処理
ファイル編集後に自動でテストを実行：
```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit",
        "hooks": [
          {
            "type": "command",
            "command": "npm test"
          }
        ]
      }
    ]
  }
}
```

### 作業完了時の処理
メインエージェントの作業完了時に実行：
```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "echo 'Work completed'; git status"
          }
        ]
      }
    ]
  }
}
```

### 通知発生時の処理
システム通知発生時にカスタム処理を実行：
```json
{
  "hooks": {
    "Notification": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "osascript -e 'display notification \"Custom notification\" with title \"Claude Code\"'"
          }
        ]
      }
    ]
  }
}
```

## 制御機能

Hooksは終了コードとJSON出力で動作を制御できます：

- **終了コード 0**: 成功
- **終了コード 2**: ブロッキングエラー（実行を停止）
- **JSON出力**: 高度な制御が可能

## 注意事項

- **セキュリティ**: Hooksはユーザーの全権限でシェルコマンドを実行します
- Hooksがエラーで失敗した場合、Claude Codeの動作がブロックされる場合があります
- 長時間実行されるコマンドは避けてください
- 必要に応じて設定を調整してください

## トラブルシューティング

Hooksでブロックされた場合：
1. 設定ファイルでhooksの設定を確認
2. 問題のあるhookを無効化または修正
3. 必要に応じてClaude Codeに設定調整を依頼
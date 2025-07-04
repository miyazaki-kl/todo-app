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

## 作業内容の受け取り

Hooksは標準入力でJSON形式のデータを受け取ります：

```json
{
  "session_id": "セッションID",
  "transcript_path": "トランスクリプトファイルのパス",
  "tool_name": "実行されたツール名",
  "tool_input": "ツールの入力内容"
}
```

### Bashスクリプトでの受け取り例

```bash
#!/bin/bash
# hook_script.sh

# 標準入力からJSONデータを読み込み
input=$(cat)

# jqを使用してデータを解析
session_id=$(echo "$input" | jq -r '.session_id')
tool_name=$(echo "$input" | jq -r '.tool_name')
tool_input=$(echo "$input" | jq -r '.tool_input')

# 作業内容をログファイルに記録
echo "[$session_id] Tool: $tool_name" >> /tmp/claude_hooks.log
echo "[$session_id] Input: $tool_input" >> /tmp/claude_hooks.log

# 成功を示す終了コード
exit 0
```

### Python スクリプトでの受け取り例

```python
#!/usr/bin/env python3
import json
import sys
import datetime

# 標準入力からJSONデータを読み込み
input_data = json.load(sys.stdin)

# データを取得
session_id = input_data.get('session_id')
tool_name = input_data.get('tool_name')
tool_input = input_data.get('tool_input')

# 作業内容をファイルに記録
with open('/tmp/claude_work_log.txt', 'a') as f:
    timestamp = datetime.datetime.now().isoformat()
    f.write(f"[{timestamp}] Session: {session_id}\n")
    f.write(f"Tool: {tool_name}\n")
    f.write(f"Input: {tool_input}\n\n")

# 成功を示す終了コード
sys.exit(0)
```

### 作業完了時の通知サンプル

```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "python3 -c \"import json, sys, subprocess; data = json.load(sys.stdin); subprocess.run(['osascript', '-e', f'display notification \\\"Session {data.get(\\\"session_id\\\", \\\"unknown\\\")} completed\\\" with title \\\"Claude Code Work Done\\\"'])\""
          }
        ]
      }
    ]
  }
}
```

## 制御機能

Hooksは終了コードとJSON出力で動作を制御できます：

### 終了コード
- **終了コード 0**: 成功
- **終了コード 2**: ブロッキングエラー（実行を停止）

### JSON出力
標準出力でJSON形式の制御情報を返すことができます：

```json
{
  "continue": true,
  "stopReason": "作業を停止しました",
  "suppressOutput": false,
  "decision": "approve"
}
```

主なフィールド：
- `continue`: 作業を継続するかどうか
- `stopReason`: 停止時のメッセージ
- `suppressOutput`: 出力をトランスクリプトから隠すかどうか
- `decision`: ツール実行の許可/拒否（"approve"/"block"）

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
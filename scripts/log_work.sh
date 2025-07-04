#!/bin/bash
# Claude Code作業ログ記録スクリプト

# 標準入力からJSONデータを読み込み
input=$(cat)

# ログファイルのパス（プロジェクトルートに配置）
log_file="$(dirname "$0")/../work_log.txt"

# 現在の日時を取得
timestamp=$(date '+%Y-%m-%d %H:%M:%S')

# jqがインストールされているかチェック
if ! command -v jq &> /dev/null; then
    echo "[$timestamp] Error: jq is not installed" >> "$log_file"
    echo "--------------------------------------------------------------------------------" >> "$log_file"
    exit 0
fi

# データを解析
session_id=$(echo "$input" | jq -r '.session_id // "unknown"')
tool_name=$(echo "$input" | jq -r '.tool_name // "unknown"')
tool_input=$(echo "$input" | jq -c '.tool_input // {}')

# 作業内容をファイルに記録
{
    echo "[$timestamp] Session: $session_id"
    echo "Tool: $tool_name"
    
    # tool_inputの内容を整理して記録
    if [ "$tool_input" != "{}" ] && [ "$tool_input" != "null" ]; then
        file_path=$(echo "$tool_input" | jq -r '.file_path // empty')
        command=$(echo "$tool_input" | jq -r '.command // empty')
        pattern=$(echo "$tool_input" | jq -r '.pattern // empty')
        content=$(echo "$tool_input" | jq -r '.content // empty')
        
        [ -n "$file_path" ] && echo "File: $file_path"
        [ -n "$command" ] && echo "Command: $command"
        [ -n "$pattern" ] && echo "Pattern: $pattern"
        
        if [ -n "$content" ]; then
            # 長いコンテンツは省略
            if [ ${#content} -gt 200 ]; then
                content="${content:0:200}..."
            fi
            echo "Content: $content"
        fi
    fi
    
    echo "--------------------------------------------------------------------------------"
} >> "$log_file"

# 成功を示す終了コード
exit 0
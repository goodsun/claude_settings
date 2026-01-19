#!/bin/bash
# Claude Code 応答完了時の通知スクリプト
# MODE を変更して切り替え:
#   sound: システムサウンド再生
#   voice: 音声読み上げ
#   notification: デスクトップ通知（無音）
#   all: デスクトップ通知（サウンド付き）

MODE="all"

# デスクトップ通知を表示（サウンド付き）
show_notification() {
    osascript -e 'display notification "応答が完了しました" with title "Claude Code" sound name "Glass"'
}

# デスクトップ通知を表示（無音）
show_notification_silent() {
    osascript -e 'display notification "応答が完了しました" with title "Claude Code"'
}

case "$MODE" in
    voice)
        say "完了しました"
        ;;
    sound)
        afplay /System/Library/Sounds/Glass.aiff
        ;;
    notification)
        show_notification_silent
        ;;
    all)
        show_notification
        ;;
    *)
        afplay /System/Library/Sounds/Glass.aiff
        ;;
esac

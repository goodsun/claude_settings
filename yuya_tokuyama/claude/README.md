# Claude Code設定集

yuya_tokuyama個人用のClaude Code設定です。コードレビュー、パフォーマンス最適化、デザイン評価、Git操作など、様々な開発タスクを支援する専門的なエージェント、コマンド、スキルを提供します。

## 📁 ディレクトリ構造

```
claude/
├── agents/          # 専門的な分析・レビューを行うエージェント定義（6種類）
├── commands/        # プロジェクト固有のワークフローコマンド（3種類）
├── hooks/           # イベントトリガーで実行されるスクリプト（1種類）
├── settings.json    # Claude Code設定
└── skills/          # 特定タスクを自動化するスキル定義（2種類）
```

## 🤖 Agents（エージェント）

専門的な知識を持つAIエージェントが、様々な観点からコードや設計を分析・レビューします。

### コード品質

#### **senior-code-reviewer**
シニアエンジニアの視点から包括的なコードレビューを実施します。可読性・保守性の評価、バグ検出、パフォーマンス最適化の提案、セキュリティ懸念事項の特定、ベストプラクティスへの準拠確認を行います。

#### **performance-tuning-expert**
パフォーマンス最適化に特化した分析を提供します。時間・空間計算量の分析（Big O表記）、ループとネスト構造の最適化、データベースクエリの効率化（N+1問題検出など）、メモリ管理、キャッシング戦略を評価します。

### API設計

#### **api-design-reviewer**
API設計の品質を評価し、ベストプラクティスへの準拠を検証します。RESTful原則、エンドポイント設計の直感性、エラーハンドリング、バージョニング戦略、ドキュメントの完全性、後方互換性を確認します。

### デザイン

#### **apple-style-web-designer**
Apple風のプレミアムなWebデザインを作成します。Apple HIGに基づくUI/UXデザイン、Core Web Vitals最適化、レスポンシブデザイン、タイポグラフィとレイアウトの最適化、パフォーマンスを考慮したデザイン提案を行います。

#### **apple-hig-design-reviewer**
Apple Human Interface Guidelinesへの準拠性をレビューします。iOS/iPadOS/macOS/watchOS/tvOS向けUIの評価、Clarity（明快さ）・Deference（控えめさ）・Depth（奥行き）の3原則チェック、SwiftUI/UIKit/AppKitコードの検証を実施します。

### Git操作

#### **commit-message-generator**
プロジェクトの規約に従った適切なコミットメッセージを生成します。README.md、CLAUDE.md、CONTRIBUTING.mdから規約を抽出し、ステージされた変更を分析、コミット履歴のパターンを学習してConventional Commits形式で生成します。

## ⚡ Commands（コマンド）

プロジェクト固有のワークフローを効率化するカスタムコマンドです。

#### **/create-commit**
プロジェクトの規約に従ったコミットを作成します。コードエラーチェック、変更確認、commit-message-generatorエージェントによる日本語コミットメッセージの生成、Conventional Commitsに従った実行を自動化します。

#### **/create-github-pr**
プロジェクト固有のフォーマットでGitHub PRを作成します。Draftモードでのプルリクエスト作成、stagingブランチへのマージ、特定フォーマット（`AG-XXXX - <タイトル>`形式、asana・ドキュメント・修正内容などのセクション）に従った本文生成を行います。

#### **/multi-review**
複数のサブエージェントを並列実行して包括的なコードレビューを実施します。senior-code-reviewer（コード品質）、performance-tuning-expert（パフォーマンス）、api-design-reviewer（API設計）の3つのエージェントが同時に分析し、統合されたレビュー結果を報告します。

## 🎯 Skills（スキル）

特定のタスクを自動化する実行可能なスキルです。

#### **git-worktree**
Git Worktreeを使用した並行開発ワークフローを支援します。緊急修正、PRレビュー、機能開発など、ブランチ切り替えなしで並行作業を可能にします。新規worktreeの作成、既存ブランチのチェックアウト、PRレビュー用環境のセットアップ、各フレームワーク（Next.js/Nuxt.js/Golang）に応じた環境構築手順を提供します。

#### **web-performance-audit**
Chrome DevTools MCPを使用してWebパフォーマンスを計測します。Core Web Vitals（LCP、FID/INP、CLS）の測定、ネットワークリクエスト分析、スクリーンショット取得、`docs/performance/YYYY-MM-DD-{domain}/`形式でのレポート出力（report.mdとaction.md）、STG環境のBasic認証対応を提供します。

## 🔔 Hooks（フック）

イベントに応じて自動実行されるスクリプトです。

#### **notify.sh**
Claude Codeの応答完了時に通知を行います。
- `voice`モード: 「完了しました」と音声で読み上げ
- `sound`モード: システムサウンド（Glass.aiff）を再生
- `notification`モード: デスクトップ通知を表示（無音）
- `all`モード: デスクトップ通知（サウンド付き）

スクリプト内の`MODE`変数で切り替え可能です。

**実行権限の付与:**

```bash
chmod +x ~/.claude/hooks/notify.sh
```

**デスクトップ通知の初期設定（初回のみ）:**

macOSでデスクトップ通知を使用するには、スクリプトエディタの通知権限が必要です：

1. スクリプトエディタを開く（Spotlight で「スクリプトエディタ」を検索）
2. 新規書類を作成（Cmd + N）
3. 以下のコードを入力して実行（▶ボタン）：
   ```applescript
   display notification "テスト" with title "Claude Code" sound name "Glass"
   ```
4. システム設定 > 通知 > スクリプトエディタ で通知を許可

## ⚙️ Settings（設定）

`settings.json`でClaude Codeの動作をカスタマイズします。

```json
{
  "alwaysThinkingEnabled": true,
   "hooks": {
      "Stop": [
         {
            "matcher": "",
            "hooks": [
               {
                  "type": "command",
                  "command": "~/.claude/hooks/notify.sh"
               }
            ]
         }
      ]
   }
}
```

- **alwaysThinkingEnabled**: 常に思考プロセスを表示
- **hooks**: イベントトリガーの設定（Stop時にnotify.shを実行）

## 📖 使い方

### Agentsの使用

Claude Codeとの対話中に、エージェントを活用したい場面で直接依頼するだけで自動的に起動します。

```
# 例1: コードレビュー
「このファイルをレビューしてください」
→ senior-code-reviewerが自動起動

# 例2: パフォーマンス分析
「このクエリのパフォーマンスを最適化してください」
→ performance-tuning-expertが自動起動

# 例3: コミットメッセージ生成
「コミットメッセージを生成してください」
→ commit-message-generatorが自動起動
```

### Commandsの実行

スラッシュコマンドとして直接実行できます。

```
/create-commit
→ 変更内容を分析し、規約に従ったコミットを作成

/create-github-pr
→ プロジェクト形式に従ったPRをDraftで作成

/multi-review
→ 変更されたファイルを複数のエージェントで並列レビュー
```

### Skillsの起動

専用コマンドでスキルを起動します。

```
「git worktreeで新しい機能を開発する準備をして」
→ git-worktree スキルが起動し、worktree作成・環境構築を案内

「https://example.com のパフォーマンスを計測してください」
→ web-performance-audit スキルが起動し、計測結果をレポート出力
```

## 🛠️ セットアップ

### 前提条件

- Claude Codeがインストールされていること
- Gitリポジトリとして管理されていること

### 使用開始手順

1. **リポジトリのクローン**
   ```bash
   git clone <repository-url>
   cd ag-local-tools
   ```

2. **Claude Codeの設定**

   `yuya_tokuyama/claude/`ディレクトリがリポジトリ内に存在することを確認します。

   Claude Codeがこの設定を認識するには：
   - このディレクトリをユーザーのホームディレクトリ`~/.claude/`配下にコピー

3. **MCP接続（Skills使用時）**

   `web-performance-audit`スキルを使用する場合は、Chrome DevTools MCPサーバーの接続が必要です。

### 動作確認

Claude Codeを起動し、以下を試してください：

```
/create-commit --help
```

コマンドが認識されれば、セットアップ完了です。


## 📝 ライセンス

チーム内での使用を目的としています。

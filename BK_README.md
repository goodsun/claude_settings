# ag-local-tools

チーム開発の効率化を支援するツール集です。Claude Code設定、Docker環境操作、個人用ユーティリティなど、開発業務を支援する様々なツールを提供します。

## リポジトリ構成

このリポジトリには以下のツール群が含まれています：

- **common/**: チーム共通のDocker環境操作ツール
- **kentaro_yoshimoto/**: 個人用ツール・スクリプト（kentaro_yoshimoto）
- **yuya_tokuyama/**: 個人用ツール・スクリプト（yuya_tokuyama）

## 📁 ディレクトリ構造

```
ag-local-tools/
├── common/                      # チーム共通ツール
│   ├── makefile                 # Docker環境操作用Makefile
│   └── README.md                # 使用方法の説明
├── kentaro_yoshimoto/           # 個人用ツール（kentaro_yoshimoto）
│   └── itag/
│       ├── claude/              # Claude Code設定集
│       │   ├── agents/          # PRレビュー用エージェント定義
│       │   └── commands/        # レビュー・レポート用コマンド
│       └── get_project_lists/   # フリーランス案件監視ツール
├── yuya_tokuyama/               # 個人用ツール（yuya_tokuyama）
│   └── claude/                  # Claude Code設定集
│       ├── agents/              # 専門的な分析・レビューを行うエージェント定義
│       ├── commands/            # プロジェクト固有のワークフローコマンド
│       ├── hooks/               # イベントトリガーで実行されるスクリプト
│       ├── settings.json        # Claude Code設定
│       └── skills/              # 特定タスクを自動化するスキル定義
└── README.md                    # このファイル
```

## 🐳 Docker環境操作（common/）

チーム共通のDocker環境（mdag/itag）を効率的に操作するためのMakefileツールです。

### 使い方

```bash
# itag環境を起動
cd common
make itag-up

# mdag環境を起動
make mdag-up

# 環境の再起動
make itag-restart
make mdag-restart

# 未使用ネットワークの削除
make prune-network
```

### 前提条件

- Docker / Docker Composeがインストールされていること
- `lv-itag/`ディレクトリ内にすべての環境が存在すること
- `common/makefile`の`DIR`変数が正しく設定されていること（デフォルト: `../..`）

詳細は[common/README.md](./common/README.md)を参照してください。


## 👤 個人用ツール

チームメンバーが個人的に使用するツールやスクリプトを格納するディレクトリです。

### kentaro_yoshimoto/

- **itag/claude/**: Claude Code設定集（PRレビュー特化）
  - **エージェント**: 3人のエキスパートによるPRレビュー
    - `veteran-web-engineer`: 15年経験、変更容易性・可読性重視
    - `security-engineer`: 10年経験、セキュリティ脆弱性検出
    - `performance-engineer`: 15年経験、パフォーマンス・負荷対策
  - **コマンド**:
    - `/review-branch`: 現在のブランチの変更をレビュー
    - `/review-pr <番号>`: GitHub PRをレビュー
    - `/monthly-report`: 月次レポート生成

- **itag/get_project_lists/**: Freelance Hubから案件情報を取得するPythonスクレイピングツール
  - 日次で案件IDを記録し、トレンド分析に活用
  - 詳細は[kentaro_yoshimoto/itag/get_project_lists/readme.md](./kentaro_yoshimoto/itag/get_project_lists/readme.md)を参照

### yuya_tokuyama/

#### claude/ - Claude Code設定集

コードレビュー、パフォーマンス最適化、デザイン評価、Git操作など、開発タスクを支援するClaude Code設定集です。

**提供機能:**
- **エージェント**: コード品質、API設計、デザイン、Git操作の専門家（6種類）
- **コマンド**: コミット作成、PR作成、マルチレビューを自動化（3種類）
- **フック**: 応答完了時のデスクトップ通知・サウンド通知（1種類）
- **スキル**: Webパフォーマンス計測、Git Worktree並行開発（2種類）
- **設定**: 思考プロセス表示、イベントトリガー

**使い方:**

Claude Codeとの対話中に自動的に起動します：

```
# エージェント使用例
「このファイルをレビューしてください」 → senior-code-reviewerが起動

# コマンド実行例
/create-commit → 規約に従ったコミットを作成
/create-github-pr → Draft PRを作成
/multi-review → 複数エージェントで並列レビュー
```

詳細は[yuya_tokuyama/claude/README.md](./yuya_tokuyama/claude/README.md)を参照してください。

### 新しい個人用ツールの追加

自分用のツールを追加する場合：

1. ルートディレクトリに自分の名前でディレクトリを作成
2. その中にツールを配置
3. 必要に応じてREADME.mdを作成して使い方を記載

## 🛠️ セットアップ

### リポジトリのクローン

```bash
git clone <repository-url>
cd ag-local-tools
```

## 📝 ライセンス

チーム内での使用を目的としています。

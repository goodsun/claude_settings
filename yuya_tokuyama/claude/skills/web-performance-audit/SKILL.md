---
name: web-performance-audit
description: ユーザーがWebサイトのパフォーマンス測定、速度チェック、Core Web Vitals計測を依頼した時に、Chrome DevTools MCPを使用してパフォーマンスを計測します。report.mdに計測結果、action.mdに改善提案を出力します。
---

# Webパフォーマンス監査スキル

このスキルは、Chrome DevTools MCPを使用してWebサイトのパフォーマンスを計測し、詳細なレポートと改善提案を生成します。

## 実行手順

1. **Chrome DevTools MCPツールの確認**
   - chrome-devtools-mcpが利用可能か確認
   - 主に使用するツール:
     - `mcp__chrome-devtools__new_page` または `mcp__chrome-devtools__navigate_page`: ページアクセス
     - `mcp__chrome-devtools__performance_start_trace`: パフォーマンストレース開始
     - `mcp__chrome-devtools__performance_stop_trace`: トレース停止とメトリクス取得
     - `mcp__chrome-devtools__take_screenshot`: スクリーンショット取得
     - `mcp__chrome-devtools__list_network_requests`: ネットワークリクエスト一覧取得
     - `mcp__chrome-devtools__performance_analyze_insight`: 詳細なパフォーマンス分析

2. **指定URLへのアクセス**
   - `mcp__chrome-devtools__new_page`または`mcp__chrome-devtools__navigate_page`でアクセス
   - **.orgドメインの場合（STG環境）**:
     - Basic認証ダイアログがブラウザに表示されます
     - ユーザーに認証情報の入力を依頼し、入力完了を待ちます
     - 認証ダイアログは自動的に表示されるため、`handle_dialog`ツールは使用しません

3. **パフォーマンストレースの実行**
   - `mcp__chrome-devtools__performance_start_trace`でトレース開始
     - `reload: true`を指定してページリロードとともに計測
     - `autoStop: false`を指定して手動で停止する場合もあり
   - ページ読み込み完了を待機
   - `mcp__chrome-devtools__performance_stop_trace`でトレース停止
   - 以下のパフォーマンスメトリクスが取得される:
     - LCP (Largest Contentful Paint)
     - FID (First Input Delay) / INP (Interaction to Next Paint)
     - CLS (Cumulative Layout Shift)
     - TTFB (Time to First Byte)
     - FCP (First Contentful Paint)
     - Total Blocking Time
     - Speed Index

4. **追加データの収集**
   - `mcp__chrome-devtools__list_network_requests`でネットワークリクエスト情報を取得
   - `mcp__chrome-devtools__take_screenshot`でページのスクリーンショットを取得
   - 必要に応じて`mcp__chrome-devtools__performance_analyze_insight`で詳細分析

5. **出力先ディレクトリの作成**
   - プロジェクトのルートディレクトリ（カレントディレクトリ）に出力
   - `docs/performance/YYYY-MM-DD-{domain}/` 形式のディレクトリを作成
     - 例: `docs/performance/2025-11-06-freelance-hub-jp/`
   - このディレクトリに以下のファイルを保存:
     - `report.md`: 計測結果レポート
     - `action.md`: 改善提案
     - `screenshot.png`: ページのスクリーンショット

6. **report.md の作成**
   - 計測日時
   - 対象URL
   - 各パフォーマンスメトリクスの値
   - Core Web Vitalsの評価（Good/Needs Improvement/Poor）
   - ページロード時間
   - リソース別の詳細データ
   - スクリーンショット（可能な場合）

7. **action.md の作成**
   - 優先度別の改善提案
   - 各提案の期待される効果
   - 具体的な実装方法
   - 参考リンク

## 出力先

**重要**: レポートはプロジェクトのルートディレクトリに出力します。

### ディレクトリ構造

```
プロジェクトルート/
└── docs/
    └── performance/
        ├── 2025-11-06-freelance-hub-jp/
        │   ├── report.md
        │   ├── action.md
        │   └── screenshot.png
        └── 2025-11-06-freelance-hub-org/
            ├── report.md
            ├── action.md
            └── screenshot.png
```

### ディレクトリ名の命名規則

- 形式: `YYYY-MM-DD-{domain-name}/`
- 例:
  - `https://freelance-hub.jp/` → `2025-11-06-freelance-hub-jp/`
  - `https://example.com/` → `2025-11-06-example-com/`
  - `https://test.example.org/` → `2025-11-06-test-example-org/`

## 出力フォーマット

### report.md
```markdown
# Webパフォーマンス計測レポート

## 基本情報
- 計測日時: YYYY-MM-DD HH:MM:SS
- 対象URL: [URL]
- デバイス: Desktop/Mobile

## Core Web Vitals
- LCP: [値]ms - [評価]
- FID: [値]ms - [評価]
- CLS: [値] - [評価]

## その他のメトリクス
- TTFB: [値]ms
- FCP: [値]ms
- Speed Index: [値]
- Total Blocking Time: [値]ms

## リソース分析
[リソース別の読み込み時間とサイズ]

## 総評
[全体的なパフォーマンスの評価]
```

### action.md
```markdown
# パフォーマンス改善提案

## 高優先度

### 1. [改善項目]
- **現状**: [問題点]
- **改善案**: [具体的な方法]
- **期待効果**: [改善後の予測]
- **参考**: [リンク]

## 中優先度
[同様の形式]

## 低優先度
[同様の形式]

## 次のステップ
1. [最初に取り組むべきこと]
2. [次に取り組むべきこと]
```

## 注意事項
- MCP接続が必要です
- **.orgドメイン（STG環境）の場合、Basic認証が必要です。ブラウザの認証ダイアログでユーザーが手動入力します**
- 計測は複数回実行して平均を取ることを推奨
- モバイルとデスクトップの両方で計測することを推奨
- 計測結果はネットワーク状況により変動する可能性があります

## 使用例

### 基本的な使用
- "https://example.com のパフォーマンスを計測して"
- "https://mikaru.org/ のパフォーマンスを計測して"（STG環境、ブラウザでBasic認証の手動入力が必要）
- "サイトの速度をチェックしてレポートを作成"
- "Core Web Vitalsを測定して改善提案をください"

### 出力結果
計測完了後、以下のような出力が行われます：
```
✅ パフォーマンス計測が完了しました

📊 作成したレポート:
- docs/performance/2025-11-06-example-com/report.md
- docs/performance/2025-11-06-example-com/action.md
- docs/performance/2025-11-06-example-com/screenshot.png
```

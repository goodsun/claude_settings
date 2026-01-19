---
name: git-worktree
description: Git Worktreeを使用した並行開発ワークフローを支援します。緊急修正、PRレビュー、機能開発など、ブランチ切り替えなしで並行作業を可能にします。
---

# Git Worktree 並行開発スキル

Git Worktreeを使用して、1つのリポジトリで複数ブランチを同時にチェックアウトし、並行作業を可能にするスキルです。

## プレースホルダーについて

このドキュメントでは以下のプレースホルダーを使用しています。実際の使用時は、ご自身のプロジェクト名に置き換えてください。

| プレースホルダー | 説明 | 例 |
|-----------------|------|-----|
| `<project-name>` | プロジェクト（リポジトリ）名 | `itag`, `mdag`, `itag-agent` |
| `<branch-name>` | ブランチ名 | `feature/user-auth`, `hotfix/bug-123` |
| `<base-branch>` | ベースとなるブランチ | `production`, `staging`, `develop` |
| `<path>` | worktreeの作成先パス | `../<project-name>-feature` |
| `<remote-branch>` | リモートブランチ | `origin/feature/add-payment` |

※ `[...]` は省略可能なオプション引数を示します

## トリガー

以下のキーワードで自動実行:
- 「git worktree」
- 「並行開発」
- 「ブランチ切り替えなしで」
- 「緊急修正しながら開発継続」
- 「PRレビューしながら作業」

## 概要

`git worktree` の主なメリット:
- 作業中のコードをstash/commitせずに別ブランチで作業可能
- PRレビュー時に開発作業を中断する必要がない
- 複数環境（staging/production）の同時確認が容易
- context switchのコストを削減

## ディレクトリ構成

プロジェクトルートと同階層にworktreeを配置する例:

```
~/dev/lv-itag/
├── itag/                    # メイン（production ブランチ）
├── itag-feature/            # 機能開発用 worktree
├── itag-hotfix/             # 緊急修正用 worktree
├── itag-review/             # PRレビュー用 worktree
```

## 基本コマンド

### Worktree一覧の確認

```bash
git worktree list
```

### Worktreeの作成

**新規ブランチを作成して worktree を追加:**
```bash
git worktree add <path> -b <new-branch> [base-branch]

# 例: productionから新機能ブランチを作成
git worktree add ../<project-name>-feature -b feature/user-analytics production
```

**既存ブランチで worktree を追加:**
```bash
git worktree add <path> <existing-branch>

# 例: 既存のhotfixブランチをチェックアウト
git worktree add ../<project-name>-hotfix hotfix/urgent-fix
```

**リモートブランチで worktree を追加（PRレビュー用）:**
```bash
git fetch origin
git worktree add <path> <remote-branch>

# 例: PRレビュー対象ブランチ
git worktree add ../<project-name>-review origin/feature/add-payment
```

### Worktreeの削除

```bash
git worktree remove <path>

# 例
git worktree remove ../<project-name>-feature
```

### クリーンアップ

```bash
git worktree prune
```

## フレームワーク別セットアップ手順

### Next.js プロジェクト（itag-agent）

```bash
# 1. プロジェクトルートで実行
cd ~/dev/lv-itag/itag-agent

# 2. 新しいWorktree作成（新規ブランチ）
git worktree add ../itag-agent-feature -b feature/new-feature production

# 3. Worktreeへ移動
cd ../itag-agent-feature

# 4. 環境変数設定
ln -s .env.local .env

# 5. Docker network確認・作成
docker network create itag_agent 2>/dev/null || true

# 6. npmパッケージインストール
docker-compose run --rm node npm i

# 7. ビルド
docker-compose run --rm node npm run build

# 8. Dockerコンテナ起動
docker-compose up -d

# 9. 開発サーバー起動（ポート: 9010）
docker-compose exec node npm run dev
```

### Nuxt.js プロジェクト（itag, mdag）

```bash
# 1. プロジェクトルートで実行
cd ~/dev/lv-itag/itag

# 2. 新しいWorktree作成（新規ブランチ）
git worktree add ../itag-feature -b feature/new-feature production

# 3. Worktreeへ移動
cd ../itag-feature

# 4. 環境変数設定
ln -s .env.local .env
# シークレットファイルがある場合
cp ../itag/.env.local.secrets .env.local.secrets

# 5. Docker network確認・作成（itag用）
docker network create itag 2>/dev/null || true
docker network create itag_bg 2>/dev/null || true
docker network create itag_agent 2>/dev/null || true
# ... 必要なネットワークを追加

# 6. npmパッケージインストール
docker-compose run --rm node npm i

# 7. ビルド
docker-compose run --rm node npm run build

# 8. Dockerコンテナ起動
docker-compose up -d

# 9. PHPパッケージインストール（必要な場合）
docker-compose exec app composer install

# 10. 開発サーバー起動（itag: 8088, mdag: 8089）
docker-compose exec node npm run dev
```

### Golang プロジェクト（itag-bg-go, mdag-bg等）

```bash
# 1. プロジェクトルートで実行
cd ~/dev/lv-itag/itag-bg-go

# 2. 新しいWorktree作成（新規ブランチ）
git worktree add ../itag-bg-go-feature -b feature/new-feature production

# 3. Worktreeへ移動
cd ../itag-bg-go-feature

# 4. Docker network確認・作成
docker network create itag_bg_go 2>/dev/null || true

# 5. Dockerコンテナ起動（ビルドも自動で実行される）
docker-compose up -d

# 6. ソース更新後のプロセス再起動
docker-compose exec app supervisorctl restart app
```

## 緊急修正対応（開発作業を中断せずに）

```bash
# 現在の作業ディレクトリ: ~/dev/lv-itag/itag
# 作業中ブランチ: feature/logging（commit前の変更あり）

# 1. 緊急修正用worktreeを作成（productionベース）
git worktree add ../itag-hotfix -b hotfix/critical-bug production

# 2. 別ターミナルで修正作業
cd ../itag-hotfix

# 3. セットアップ（フレームワークに応じて実行）
ln -s .env.local .env
docker-compose run --rm node npm i
docker-compose run --rm node npm run build
docker-compose up -d

# 4. 修正を実施してcommit & push
git add -A
git commit -m "fix: 緊急バグ修正"
git push origin hotfix/critical-bug

# 5. PR作成 & マージ後、worktreeを削除
cd ../itag
git worktree remove ../itag-hotfix

# 6. 元の作業に戻る（変更はそのまま残っている）
# feature/logging の作業を継続...
```

## PRレビュー

```bash
# 1. リモートブランチを取得
git fetch origin

# 2. レビュー用worktreeを作成
git worktree add ../itag-review origin/feature/add-auth

# 3. 別ターミナルでセットアップ
cd ../itag-review

# 4. 環境設定
ln -s .env.local .env
cp ../itag/.env.local.secrets .env.local.secrets

# 5. セットアップ
docker-compose run --rm node npm i
docker-compose run --rm node npm run build
docker-compose up -d
docker-compose exec app composer install

# 6. 開発サーバー起動
docker-compose exec node npm run dev

# 7. ブラウザで確認しながらレビュー
# itag: http://localhost:8088
# mdag: http://localhost:8089
# itag-agent: http://localhost:9010

# 8. レビュー完了後、worktreeを削除
cd ../itag
git worktree remove ../itag-review
```

## Claude Code での活用

### 複数worktreeで並行作業

```bash
# ターミナル1: メイン開発
claude --cwd ~/dev/lv-itag/itag

# ターミナル2: 機能開発
claude --cwd ~/dev/lv-itag/itag-feature

# ターミナル3: PRレビュー
claude --cwd ~/dev/lv-itag/itag-review
```

### 複数ディレクトリ対応

```bash
claude --add-dir ~/dev/lv-itag/itag-feature
```

## 注意点

### 制限事項

| 項目 | 説明 |
|------|------|
| 同一ブランチ不可 | 同じブランチを複数のworktreeで同時にチェックアウトできない |
| Docker volume | 各worktreeでDockerボリュームが共有される場合があるため注意 |
| ディスク容量 | node_modules/vendorが個別に必要なため容量を消費 |
| lockファイル | package-lock.json, go.mod/go.sum の整合性に注意 |
| Docker network | 各worktreeで同じnetworkを使用する場合、コンテナ名の競合に注意 |

### ポート競合の回避

各プロジェクトはデフォルトで異なるポートを使用:

| プロジェクト | ポート |
|-------------|--------|
| itag | 8088 |
| mdag | 8089 |
| itag-agent | 9010 |
| Kibana (itag) | 5601 |
| Kibana (mdag) | 5602 |
| MinIO (itag-bg-go) | 9291 |
| MinIO (mdag-bg) | 9091 |

同一プロジェクトの複数worktreeを同時起動する場合は、docker-compose.ymlのポート設定を変更するか、片方のコンテナを停止してください。

### 作業完了後のクリーンアップ

```bash
# Dockerコンテナを停止
docker-compose down

# 不要なworktreeを削除
git worktree remove <path>

# 参照切れのworktreeをクリーンアップ
git worktree prune
```

## トラブルシューティング

### "fatal: '<branch>' is already checked out"

**原因**: 指定したブランチが既に別のworktreeでチェックアウトされている

**解決策**:
```bash
# どこでチェックアウトされているか確認
git worktree list

# そのworktreeを削除するか、別のブランチ名を使用
```

### "fatal: '<path>' already exists"

**原因**: 指定したパスに既にディレクトリが存在する

**解決策**:
```bash
rm -rf <path>
# または別のパスを指定
git worktree add <different-path> <branch>
```

### Dockerコンテナが起動しない

```bash
# Docker networkが存在するか確認
docker network ls

# 必要なnetworkを作成
docker network create <network-name>

# コンテナを再起動
docker-compose down
docker-compose up -d
```

### node_modules/vendor がおかしい

```bash
cd <worktree-path>

# Node.jsの場合
rm -rf node_modules
docker-compose run --rm node npm i

# PHPの場合
rm -rf vendor
docker-compose exec app composer install
```

## 使用例

### 基本的な使用

```
ユーザー: "git worktreeで新しい機能を開発する準備をして"

→ スキルが自動実行:
1. git worktree list で現状確認
2. 新規worktree作成
3. 環境変数設定（.env, .env.local.secrets）
4. Docker network作成
5. 依存関係のインストール実行
6. Dockerコンテナ起動
7. 開発開始の案内
```

```
ユーザー: "PRレビュー用のworktreeを作成して"

→ スキルが自動実行:
1. git fetch origin
2. レビュー対象ブランチでworktree作成
3. セットアップ実行
4. レビュー環境の案内
```

```
ユーザー: "緊急修正が必要、でも今の作業は中断したくない"

→ スキルが自動実行:
1. hotfix用worktree作成
2. 別ターミナルでの作業手順を案内
3. 修正完了後のクリーンアップ手順を案内
```

## 参考リンク

- [Git公式ドキュメント: git-worktree](https://git-scm.com/docs/git-worktree)

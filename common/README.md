# Docker 環境操作

## Overview

環境毎に実行するコマンドが多く、また長くなっていることから、ショートコマンドとして makefile にまとめている。
make コマンドの実行にあたって、事前にインストールするパッケージは特にないが、lv-itag ディレクトリ内に、すべての環境が存在することが前提となっている。

## Usage

### DIR の確認

makefile の DIR 変数は、`lv-itag/` までの相対パスを指定する。
デフォルトでは、2 階層上を想定しているため、`../..` となっているが、必要であれば適宜変更すること。

### 基本コマンド

```bash
$ make mdag-up // mdag環境を立ち上げる

$ make itag-up // itag環境を立ち上げる

$ make mdag-restart // mdag環境を再起動する

$ make itag-restart // itag環境を再起動する

$ mdag-recreate-network // mdag環境のネットワークを再作成する

$ itag-recreate-network // itag環境のネットワークを再作成する
```

### その他

```bash
$ make prune-network // 未使用のネットワークを削除する
```

## Note

- up コマンドで立ち上がる環境について、不要な環境が存在する場合は対象行をコメントアウトする

# kintone プラグインアップローダー

## 説明

このスクリプトは、kintone にプラグインファイルをアップロードおよび更新するためのツールです。以下の機能を提供します：
- 環境変数、コマンドライン引数、または環境変数ファイルから kintone のドメイン、ユーザー名、およびパスワードを取得。
- プラグインファイルのアップロードおよび更新。
- プラグインIDの保存および読み込み。
- プラグインファイルの変更を監視し、自動的にアップロードするオプション。

## 使用方法

### インストール

1. リポジトリをクローン:
    git clone https://github.com/rex0220/kintone-plugin-uploader.git
    cd kintone-plugin-uploader

2. 依存関係をインストール:
    npm install

### スクリプトの実行

    node plugin-uploader.js --file <path_to_plugin_file> [options]

### オプション

- `--envfile`, `-e`: 環境変数ファイルのパス。
- `--domain`, `-d`: kintone ドメイン。
- `--username`, `-u`: kintone ユーザー名。
- `--password`, `-p`: kintone パスワード。
- `--file`, `-f`: プラグインファイルのパス。（必須）
- `--watch`, `-w`: プラグインファイルの変更を監視。（デフォルト: false）
- `--waittime`, `-t`: アップロード前の待機時間（ミリ秒）。（デフォルト: 0）
- `--id`, `-i`: プラグインID。（デフォルト: ''）

### 環境変数ファイル

環境変数ファイルを使用する場合は、以下の形式で `.env` ファイルを作成してください：

    KINTONE_DOMAIN=your_domain
    KINTONE_USERNAME=your_username
    KINTONE_PASSWORD=your_password

### 例

    node plugin-uploader.js --file ./my-plugin.zip --domain mydomain --username myuser --password mypass

### 作成者

rex0220 作成

## ライセンス

このプロジェクトは MIT ライセンスの下でライセンスされています。

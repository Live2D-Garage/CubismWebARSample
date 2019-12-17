# 開発ガイドライン


## 必要な開発環境

* [Node.js](https://nodejs.org/)
* [Google Chrome](https://www.google.com/intl/en_US/chrome/)
* [Git](https://git-scm.com/)（推奨）
* [Visual Studio Code](https://code.visualstudio.com/)（推奨）


## Git で リポジトリをクローンする

本アプリケーションはサブモジュールとして [CubismWebSamples] を登録しています。
そのため Git で本リポジトリをクローンした場合、サブモジュールの初期化・更新が必要です。

[CubismWebSamples] 内の `/Core/` ディレクトリ内には必要なファイルがないため、[Live2D Cubism SDK for Web] からファイルをコピーします。

[CubismWebSamples]: https://github.com/Live2D/CubismWebSamples
[Live2D Cubism SDK for Web]: https://www.live2d.com/download/cubism-sdk/#sdk3


## npm スクリプト一覧

### start

`npm run start`

開発時に使用するコマンドです。

アプリケーションのビルドを行い、ファイルの監視を行います。
変更を検知して自動で再ビルド・ブラウザの再ロードを行います。

* ブラウザから閲覧時に警告画面が表示されるため、無視して続行する必要があります

#### 別端末から動作を確認する

自動で開かれたブラウザに表示された URL をスマートフォンに入力することで、アクセスすることができます。

* 開発機とスマートフォンは同じネットワークに接続されている必要があります
* 開発機のファイアウォールをオフにするかポートの開放が必要になる場合があります

### build / build:prod

| 種類 | コマンド |
| --- | --- |
| 開発ビルド | `npm run build` |
| 公開ビルド | `npm run build:prod` |

ソースコードのビルドを行います。

ビルドした成果物は `./dist/` ディレクトリ以下に出力されます。

### lint / lint:fix

| 種類 | コマンド |
| --- | --- |
| 静的解析 | `npm run lint` |
| 静的解析 + 自動修正 | `npm run lint:fix` |

[ESLint] と [Prettier] を用いてコードの静的解析とフォーマットの調整を行います。

[ESLint]: https://eslint.org/
[Prettier]: https://prettier.io/

### openssl / serve

| 種類 | コマンド |
| --- | --- |
| SSL 証明書の発行 | `npm run openssl` |
| 簡易サーバの起動 | `npm run serve` |

https 接続が可能な簡易サーバーを作成します。
本番環境に近い状態でビルドした成果物の動作確認ができます。

簡易サーバの起動の前に SSL 証明書の発行が必要になります。
発行には [OpenSSL] のインストールが必要になります。

コマンドに成功すると、ディレクトリ内に `key.pem` と `cert.pem` が生成されます。
証明書の期限はデフォルトでは1日に設定しています。

[OpenSSL]: https://www.openssl.org/

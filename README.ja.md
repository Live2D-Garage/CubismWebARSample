# Cubism WebAR Sample

Cubism WebAR Sample は [Live2D Cubism SDK for Web] と [AR.js] を組み合わせ、
[Live2D Cubism Editor] で出力した Live2D モデルを Web カメラを通して AR マーカー上に表示するサンプルプロジェクトです。

Web ブラウザ上で動作するため、アプリケーションのインストールが必要なく手軽に AR コンテンツを楽しむことができます。

モデルデータを差し替えるだけでお手持ちの Live2D モデルを表示することができます、またオリジナルの AR マーカーを利用することも可能です。
AR マーカーを名刺やポスターなどに埋め込むことで、Live2D モデルのプロモーションを行なうことができます。

さらに、マーカーを利用しないツーショットモードも用意しており、Live2D モデルと一緒に写真を撮ることができます。

[Live2D Cubism SDK for Web]: https://www.live2d.com/download/cubism-sdk/
[AR.js]: https://github.com/jeromeetienne/AR.js/
[Live2D Cubism Editor]: https://www.live2d.com/

Read this in other languages: [English](README.md), [日本語](README.ja.md).

![Demo](/docs/imgs/demo.png)

## ライセンス

[LICENSE.md](LICENSE.md) を参照してください。


## 推奨環境

| | Android | iPhone, iPad | PC |
| --- | --- | --- | --- |
| OS | Android 7.0 以上 | iOS 11 以上 | Windows または macOS |
| ブラウザ | Google Chrome | Safari | Google Chrome |


## 開発環境

| Name | Version |
| --- | --- |
| Cubism SDK | Cubism 5 SDK for Web R1 beta4 [5-r.1-beta.4] |
| Node.js | 20.11.0 |


## ドキュメント

* [クイックスタート](/docs/QuickStart.md)
* [AR マーカーガイドライン](/docs/ARMarker.md)
* [開発ガイドライン](/docs/Development.md)
* [トラブルシューティング](/docs/TroubleShooting.md)


## 既知の不具合

* モデル設定ファイルの scale 項目の設定値によっては、視線追従機能が正しく機能しません
  * 視線追従機能は `/src/lappdefine.ts` 内で無効に設定されています
* 通常表示時とビルボーディング表示時でモデルの表示位置が変わります
* 端末の画面の比率によってモデルの表示サイズが変わります


## ディレクトリ構成

```
.
├─ assets           # 画像やモデルなどのリソース
│  ├─ css           # スタイルファイル
│  ├─ data          # AR.js 用のカメラデータファイル
│  └─ models        # モデルファイル・マーカーファイル
├─ CubismWebSamples # Cubism SDK for Web（サブモジュール）
├─ docs             # 本アプリケーションに関するドキュメント
├─ lib              # サードパーティのライブラリなど
├─ script           # ビルドコマンドなどを自動で実行するスクリプト
└─ src              # 本アプリケーションの実装コード
```


## サードパーティ

| Name | Version |
| --- | --- |
| [AR.js] | 2.0.8 |


## プロジェクトへの貢献

### フォークとプルリクエスト

修正、改善、さらには新機能をもたらすかどうかにかかわらず、プルリクエストに感謝します。メインリポジトリを可能な限りクリーンに保つために、必要に応じて個人用フォークと機能ブランチを作成してください。



## フォーラム

ご不明な点がございましたら、公式のLive2Dフォーラムに参加して、他のユーザーと話し合ってください。

- [Live2D 公式クリエイターズフォーラム](https://creatorsforum.live2d.com/)
- [Live2D Creators Forum(English)](https://community.live2d.com/)

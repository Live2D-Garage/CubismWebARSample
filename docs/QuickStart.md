# クイックスタート

このドキュメントでは、オリジナルの Live2D モデルと AR マーカーを用いて AR 空間上にモデルを表示させるアプリケーションを公開するまでの手順を簡単に紹介します。


## [Step1] プロジェクトの準備

1. 本リポジトリのダウンロードを行います
    * [最新バージョンの配布ページ]から *Source code (zip)* をクリックすると入手できます

1. 次のスクリプトファイルを実行して、必要なファイルをダウンロードします
    * Windows: `本プロジェクト/scripts/windows/install.bat`
    * macOS: `本プロジェクト/scripts/macos/install.sh`

[最新バージョンの配布ページ]: https://github.com/Live2D/CubismWebARSample/releases/latest

NOTE: Windows 上でスクリプトの実行時にセキュリティ警告ポップアップが表示された場合下記を参照してください。

[Windows 10で「WindowsによってPCが保護されました」が表示される場合の対処方法](https://121ware.com/qasearch/1007/app/servlet/relatedqa?QID=020594)

### macOS でスクリプトを実行する手順

1. 「ターミナル」アプリを開く
1. スクリプトファイルをターミナルにドラッグ＆ドロップ
1. ターミナル上でエンターキーでスクリプトを実行


## [Step2] サンプルのテスト実行

1. 次のスクリプトファイルを実行すると簡易サーバが立ち上がり、ブラウザが起動します
    * Windows: `本プロジェクト/scripts/windows/start.bat`
    * macOS: `本プロジェクト/scripts/macos/start.sh`
    * 実行するとプロジェクト内に `node_modules` フォルダが作成されます
1. 起動したブラウザに警告画面が表示された場合は、*詳細設定*からアクセスします
    * ブラウザによってメッセージが異なる場合があります
1. カメラの使用許可を求められた場合は、許可を選択します
1. 次のマーカー画像をアプリケーション上のカメラで映すと、モデルが描画されます

    ![Rice Marker](../assets/models/Rice/Rice.png)

NOTE: プロジェクト内のファイルを更新して保存すると、自動的にアプリケーションが再起動します。

NOTE: ターミナル(コマンドプロンプト)のウィンドウを閉じると簡易サーバが終了され、アプリケーションにアクセスできなくなります。
再度アプリケーションにアクセスする場合はもう一度スクリプトファイルを実行してください。

### 携帯端末からアプリケーションにアクセスする

携帯端末で実行中のアプリケーションの URL を入力すると、携帯端末からアプリケーションを利用することができます。

NOTE: モデルが表示されない、カメラが使用できないなどの症状が発生した場合は[トラブルシューティング](TroubleShooting.md)を参照してください。


## [Step3] 組み込み用モデルを配置

1. Cubism Editor 上で使用するモデルを用意する
    * モデルはキャンバスの中央に配置してください
1. Cubism Editor 上でモデルの組み込み用ファイル書き出しを行います
    * 書き出し先: `本プロジェクト/assets/models/モデル名/モデル名.moc3`
    * 組み込み用ファイルの書き出しに関する詳細は Cubism Editor マニュアルの[組み込み用データ]記事内の*組み込み用ファイルの書き出し*を参照してください

[組み込み用データ]: https://docs.live2d.com/cubism-editor-manual/export-moc3-motion3-files/

`models` フォルダ以下が下記のような構成になっていることを確認してください

例）
```
.
└─ assets
   └─ models
      ├─ Haru
      │  ├─ Haru.2048
      │  │  └─ texture_00.png
      │  ├─ Haru.moc3
      │  └─ Haru.model3.json
      └─ models.toml
```


## [Step4] マーカーを作成する

AR マーカーの詳細は [AR マーカーガイドライン](ARMarker.md) を参照してください。

1. [AR.js Marker Training] にアクセスします
1. *UPLOAD* ボタンからマーカーに使用する画像を選択します
1. *Pattern Ratio* の値を `0.90` に設定します
1. *DOWNLOAD MARKER* からパターンファイル (`.patt`) をダウンロードします
    * *DOWNLOAD IMAGE* からマーカー画像がダウンロードできます
1. パターンファイルの名前を `モデル名.patt` に変更します
1. パターンファイルを `モデル名.model3.json` と同じフォルダに配置してください

[AR.js Marker Training]: https://jeromeetienne.github.io/AR.js/three.js/examples/marker-training/examples/generator.html

`models` フォルダ以下が下記のような構成になっていることを確認してください

例）
```
.
└─ assets
   └─ models
      ├─ Haru
      │  ├─ Haru.2048
      │  │  └─ texture_00.png
      │  ├─ Haru.moc3
      │  ├─ Haru.model3.json
      │  └─ Haru.patt         # パターンファイル
      └─ models.toml
```


## [Step5] モデル設定ファイルを編集する

`本プロジェクト/assets/models/models.toml` がモデル設定ファイルです。

### モデル設定記述テンプレート

```toml
[[models]]
# モデル名
name = "モデル名"
# ビルボーディング表示設定
billboarding = false
# AR 空間上のモデルの拡大率
scale = 1
# AR 空間上のモデルの表示位置
[models.position]
x = 0 # 左右位置
y = 0 # 上下位置
z = 0 # 前後位置
# AR 空間上のモデルの表示角度調整
[models.rotation]
x = 0 # X軸回転
y = 0 # Y軸回転
z = 0 # Z軸回転
# モデルの当たり判定とモーショングループの紐付け
[models.hitInfo]
# 当たり判定ID = "モーショングループ名"
```

NOTE: モデル設定ファイルの書式は TOML (v0.4.0) に沿って書く必要があります。
* TOMLの言語使用は[TOML 公式ドキュメント]から確認できます
* [TOML Lint] を利用すると正しく記述できているか確認できます

[TOML 公式ドキュメント]: https://github.com/toml-lang/toml/blob/master/versions/ja/toml-v0.4.0.md
[TOML Lint]: https://www.toml-lint.com/

### モデル設定の手順

1. `models.toml` をメモ帳などのテキストエディタで開いてください
1. ファイル内に記述されている内容を削除して、上記の[モデル設定記述テンプレート](#モデル設定記述テンプレート)の内容を記述します
1. モデル名の設定値をモデルの名前に変更します
1. *Step4* で作成したマーカー画像をアプリケーション上のカメラから写してモデルが描画されることを確認します

`models.toml` ファイル設定例
```toml
[[models]]
name = "Haru"
```

NOTE: `models.toml` 内の `#` から始まる行はコメント記述のため、削除しても問題ありません。


## [Step6] モデルの表示設定を行う

モデル設定ファイルの各項目を編集することで、モデルの表示調整を行うことができます

### 各項目の説明

#### `billboarding`

ビルボーディング表示の有効無効を設定します。

通常、AR 空間上でモデルは **ARマーカーに対して垂直に立っているように描画**されます。

ビルボーディング表示を有効にすると、AR 空間上でモデルは **常にカメラに対して正面に描画**されます。

ビルボーディング表示を有効にするには下記のように設定します。

```toml
billboarding = true
```

#### `scale`

AR 空間上のモデルの拡大率を設定します。

例）モデルのサイズを 4.5 倍 大きくする
```toml
scale = 4.5
```

#### `[models.position]`

AR 空間上のモデルの表示位置を設定します。

机においた AR マーカーに対して各設定項目は下記の通りになります。

| 設定項目 | 説明 |
| --- | --- |
| `x` | 左右の位置 |
| `y` | 上下の位置 |
| `z` | 前後の位置 |

例）モデルの表示位置をマーカーに対して上方向に調整する
```toml
[models.position]
x = 0
y = 0.2 # 上方向に調整
z = 0
```

NOTE: **`scale` の値が大きいとモデルの表示位置が大きく変化します**。

#### `[models.rotation]`

AR 空間上のモデルの回転位置を設定します。
数値は度数表記で設定します。

卓上においた AR マーカーに対して各設定項目は下記の通りになります。

| 設定項目 | 説明 |
| --- | --- |
| `x` | X軸回転の角度 |
| `y` | Y軸回転の角度 |
| `z` | Z軸回転の角度 |

例）モデルを上下逆さまにする
```toml
[models.rotation]
x = 0
y = 0
z = 180 # 時計回りに180度回転させる
```

#### `[models.hitInfo]`

*Step8* で説明します


## [Step7] アイドリングモーションを再生する

アイドリングモーションを設定することで、モデルが設定されたモーションを常に再生します。

1. Cubism Editor 上でアイドリング用のモーションの作成を行います
1. Cubism Editor 上でモデルの組み込み用ファイル書き出しを行います
1. Cubism Viewer for OW 上でモデルを表示させ、作成したモーションのモーショングループ名を **Idle** に設定します
    * 設定する方法は Cubism Editor マニュアルの[モデルとモーションの読み込み]記事内の *アイドリングモーションの自動再生* を参照してください
1. 変更したモデルを本プロジェクトに取り込み、アプリケーション上でアイドリングモーションが再生できていることを確認します

[モデルとモーションの読み込み]: https://docs.live2d.com/cubism-editor-manual/load-model-and-motion/


## [Step8] 当たり判定とモーションを紐付ける

AR 空間上のモデルの特定箇所をタップすると、特定のモーションを再生するように設定します。

1. Cubism Editor 上でモーションの作成を行います
1. Cubism Editor 上で当たり判定メッシュの作成と ID 名の設定を行います
    * 設定する方法は Cubism Editor マニュアルの[当たり判定の設定準備]を参照してください
1. Cubism Editor 上でモデルの組み込み用ファイル書き出しを行います
1. Cubism Viewer for OW 上でモデルを表示させ、作成したモーションに任意のモーショングループ名を設定します
1. モデル設定ファイル内の `[models.hitInfo]` 項目を下記のように編集します
    ```
    当たり判定ID = "モーショングループ名"
    ```
1. アプリケーション上でモデルの当たり判定を設定した箇所をタップした時に、モーションが再生されます

[当たり判定の設定準備]: https://docs.live2d.com/cubism-editor-manual/hittest/

例）当たり判定 ID「HitAreaBody」のメッシュをタップした時に、モーショングループ名「TapBody」のモーションを再生するように設定する

```toml
[models.hitInfo]
HitAreaBody = "TapBody"
```

NOTE: モーショングループ名は**ダブルクォーテーション（"）**で囲まれている必要があります。

下記のように複数の当たり判定を設定することも可能です

```toml
[models.hitInfo]
HitAreaHead = "TapHead"
HitAreaBody = "TapBody"
```


## [Step9] アプリケーションの公開

下記のスクリプトファイルを実行するとアプリケーションのビルドが行われます。
  * Windows: `/scripts/windows/build.bat`
  * macOS: `/scripts/macos/build.sh`
  * 実行するとプロジェクト内に `dist` フォルダが作成されます

実行後、下記のフォルダ・ファイルをサーバにアップロードすることで、アプリケーションの公開ができます。

* `本プロジェクト/assets/`
* `本プロジェクト/dist/`
* `本プロジェクト/lib/`
* `本プロジェクト/index.html`

上記以外のフォルダ・ファイルはアップロードの必要はありません。
公開手順等は省略します。

NOTE: アップロード後に `assets` フォルダ以下の変更を行なった場合（モデルの更新やモデル設定ファイルの変更など）は、**再ビルドの必要はありません**。更新したファイルを再度サーバにアップロードすることで公開しているアプリケーションの更新が可能です。

NOTE: 本アプリケーションを公開する際は **https** 接続でアクセスできる必要があります。[GitHub Pages] や [Netlify] といった静的サイトのホスティングサービスを利用すると簡単に https 接続で公開ができます。

[GitHub Pages]: https://pages.github.com/
[Netlify]: https://www.netlify.com/


## [Advanced1] モデルの複数表示

`本プロジェクト/assets/models/` フォルダにモデルを追加して複数のモデルを表示することができます。

`models.toml` は下記の例のように編集を行います。

```toml
# モデル1
[[models]]
name = "Haru"
scale = 4
[models.hitInfo]
HitAreaBody = "TapBody"

# モデル2
[[models]]
name = "Koharu"
scale = 3
[models.position]
y = 0.2
[models.hitInfo]
BodyMesh = "BodyMotions"
```

NOTE: マーカーは別々に用意する必要があります。複数のマーカーのデザインが似ていると意図しないモデルが表示される場合があります。

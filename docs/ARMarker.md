# AR マーカーガイドライン

本アプリケーションでは AR.js のマーカーベースの機能を利用しています。

特定の条件の*マーカーパターン*を作成して、そのパターンファイルを AR.js 上で読み込むことでマーカーが認識できます。

AR.js のマーカーベースに関する詳細は [AR.js のドキュメント]を参照してください。

[AR.js のドキュメント]: https://github.com/jeromeetienne/AR.js/blob/master/README.md#what-marker-based-means


## マーカーの条件

* 一定の太さの黒か白の正方形の枠で囲まれている
* 枠内に**回転非対称**な任意の画像・文字がある
* 枠内の背景は枠とは対照的（黒枠であれば明るい色）である

その他詳細は [artoolkit-docs] を参照してください。

[artoolkit-docs]: https://github.com/artoolkit/artoolkit-docs/blob/master/3_Marker_Training/marker_training.md

## マーカーの作成

マーカー及びパターンファイルの作成は [AR.js Marker Training] から手軽に行えます。

[AR.js Marker Training]: https://jeromeetienne.github.io/AR.js/three.js/examples/marker-training/examples/generator.html

マーカー用の画像は、イラストのほかQRコードや文字なども利用できます。
QRコードをマーカーとすることでアプリケーションへのリンクと AR マーカーを兼用することができます。

## マーカーの枠の太さの調整

上記サイトの *Pattern Ratio* の値を変更することでマーカーの枠の太さを変更できます。

この値は AR.js 側に設定する必要があります。
本アプリケーションでは `/src/lappdefine.ts` 内の `PATTERN_RATIO` 変数の値を上記で設定した値と同じ値にして、ビルドを行うことで変更できます。

また、この値はアプリケーション全体で共通となるため、複数のマーカーを用いる場合は全てのマーカーの枠の太さを揃える必要があります。

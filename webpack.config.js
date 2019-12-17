const path = require('path')

module.exports = {
  mode: process.env.NODE_ENV || 'development',
  entry: './src/main.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js',
    publicPath: '/dist/'
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.ts$/,
        exclude: [/CubismWebSamples/, /node_modules/],
        loader: 'eslint-loader',
        options: {
          cache: true,
          formatter: 'codeframe',
          fix: true
        }
      },
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: 'ts-loader'
      }
    ]
  },
  devServer: {
    watchContentBase: true,
    inline: true,
    hot: true,
    open: true,
    https: true,
    host: '0.0.0.0',
    compress: true,
    useLocalIp: true
  }
}

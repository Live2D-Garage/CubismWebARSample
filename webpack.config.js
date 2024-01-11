const ESLintPlugin = require('eslint-webpack-plugin');

const path = require('path')

const options = {
  extensions: [`ts`],
  exclude: [
    `/node_modules/`,
    `/CubismWebSamples/`,
  ],
  cache: true,
  formatter: 'codeframe',
  fix: false,
  useEslintrc: true,
}

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
  //plugins: [new ESLintPlugin(options)],
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: 'ts-loader'
      }
    ]
  },
  devtool: 'inline-source-map',
  devServer: {
    static: {
      directory: path.resolve(__dirname, "./"),
    },
    hot: true,
    open: true,
    https: true,
    host: 'localhost',
    compress: true,
  }
}

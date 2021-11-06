const path = require('path')
const WebpackShellPlugin = require('webpack-shell-plugin-next')
// uncomment to analyze bundle usage
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

module.exports = {
  entry: './src/index.ts',
  output: {
    filename: 'worker.js',
    path: path.join(__dirname, 'dist'),
  },
  devtool: 'cheap-module-source-map',
  mode: 'development',
  resolve: {
    extensions: ['.ts', '.js'],
    fallback: {
      "fs": false,
      "os": false,
      "crypto": false,
      "util": false
    },
  },
  plugins: [
    new WebpackShellPlugin({
      onBuildStart: {
        scripts: [
          'echo "Starting build"',
          'make build'
        ],
        blocking: true,
        parallel: false
      },
      onBuildEnd: {
        scripts: [
          'echo "Done with build"'
        ]
      },
    }),
    // new BundleAnalyzerPlugin()
  ],
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
      },
    ],
  },
  optimization: {
    minimize: true
  }
}

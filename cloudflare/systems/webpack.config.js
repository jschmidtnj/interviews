const path = require('path')
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')
const WebpackShellPlugin = require('webpack-shell-plugin-next')

module.exports = {
  entry: './src/index.ts',
  output: {
    filename: 'worker.js',
    path: path.join(__dirname, 'dist'),
  },
  devtool: 'cheap-module-source-map',
  mode: 'development',
  // target: 'node',
  // externalsPresets: { node: true },
  resolve: {
    extensions: ['.ts', '.js'],
    fallback: {
      "fs": false
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
    new NodePolyfillPlugin()
  ],
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
      },
    ],
  },
}

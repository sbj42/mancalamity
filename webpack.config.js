/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');

module.exports = {
  entry: './src/index.ts',
  mode: 'production',
  module: {
    rules: [
        {
          test: /\.ts$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      {
        test: /\.css$/,
        use: [ 'style-loader', 'css-loader' ],
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [ '.ts', '.js' ],
  },
  output: {
    filename: 'mancalamity.js',
    path: path.resolve(__dirname, 'game', 'build'),
  },
};
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry: {
    code: './web/app.jsx',
    'autocomplete-demo': './web/autocomplete-demo.jsx',
  },
  // devtool: 'source-map',
  output: {
    path: 'build',
    filename: '[name].js'
  },
  module: {
    loaders: [
      { test: /\.jsx$/, loader: 'jsx-loader?harmony' },
      { test: /\.tsx?$/, loader: 'ts-loader' },
      { test: /\.scss$/,
        loader: ExtractTextPlugin.extract('style-loader',
                                          'css-loader!sass-loader') }
    ],
  },
  resolve: {
    extensions: ['', '.js', '.jsx', '.scss', '.ts', '.tsx']
  },
  plugins: [
    // new webpack.optimize.UglifyJsPlugin({minimize:true}),
    new ExtractTextPlugin('[name].css'),
  ],
  externals: {
    'react': 'React'
  },
  devServer: {
    contentBase: 'build/',
    // hot: true,
    // inline: true,
    port: 9090,
    proxy: {
      '*': 'http://localhost:8080',
    },
  }
}

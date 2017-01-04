var webpack = require('webpack'),
    path = require('path');

var ProgressBarPlugin = require('progress-bar-webpack-plugin');
var UnminifiedWebpackPlugin = require('unminified-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var LiveReloadPlugin = require('webpack-livereload-plugin');

var APP = __dirname + '/app';

module.exports = {
      devtool: "source-map",
     context: APP,
     entry: {
      app: __dirname + "/webpack.files-all.js",
      vendors: __dirname + "/app/vendors.js",
    },
    output: {
        path: __dirname + '/public',
        filename: '[name].min.js'
    },

    module: {
      loaders: [
        { test: /\.js$/, exclude: /node_nodules/, loader: "babel-loader" },
        { test: /\.html/, exclude: /node-modules/, loader: "raw" },
        { test: /\.scss$/, loader: 'style!css!sass' },
        { test: /\.less$/, loader: "style!css!less" },
        { test: /\.css$/, loader: "style-loader!css-loader" },
        { test: /.woff$|.woff2$|.ttf$|.eot$|.svg$/, loader: 'url-loader' },
        { test: /\.(jpe?g|png|gif|svg)$/i,
            loaders: [
                'file?hash=sha512&digest=hex&name=[hash].[ext]',
                'image-webpack?bypassOnDebug&optimizationLevel=7&interlaced=false'
            ]
        }
      ]
    },
    htmlLoader: {
      ignoreCustomFragments: [/\{\{.*?}}/]
    },
    resolve: {
      extensions: ["", ".js"]
    },

    plugins: [
      new ProgressBarPlugin(),
      new webpack.optimize.DedupePlugin(),
      new webpack.ProvidePlugin({
           $: "jquery",
           jQuery: "jquery",
           "window.jQuery": "jquery"
       }),
       new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        }),
        //new UnminifiedWebpackPlugin(),
        new HtmlWebpackPlugin({  // Also generate a test.html
            filename: '_index.html',
            inject: false,
            template: APP + '/template-index.html'
        }),
        // new LiveReloadPlugin({
        //     appendScriptTag: true
        // })
      

  ],
};
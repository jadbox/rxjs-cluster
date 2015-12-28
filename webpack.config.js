var webpack = require('webpack');
var path = require('path');
var fs = require('fs');

var nodeModules = { classnames: 'commonjs classnames', react: 'commonjs react' };
fs.readdirSync('node_modules')
  .filter(function(x) {
    return ['.bin'].indexOf(x) === -1;
  })
  .forEach(function(mod) {
    nodeModules[mod] = 'commonjs ' + mod;
  });

module.exports = {
    context: __dirname,
    entry: {
        javascript: path.join(__dirname, 'src', 'index.js')
    },
    target: 'node',
    resolveLoader: {
      modulesDirectories: [
          path.join(__dirname, "node_modules")
      ]
    },
    module: {
        loaders: [{
            test: /\.js$/,
            exclude: /(node_modules|test|views)/,
            loader: 'babel',
            query: {
              cacheDirectory: '/tmp',
              presets: ['es2015'],
              plugins: ["transform-function-bind"]
            }
        }]
    },
    /*resolve: {
      extensions: ['', '*.js']
    },*/
    output: {
        filename: "app.js",
        libraryTarget: "commonjs",
        library: "",
        path: path.resolve(__dirname, 'dist')
    },
    plugins: [
      new webpack.BannerPlugin('require("source-map-support").install();',
                             { raw: true, entryOnly: false })
    ],
    externals: nodeModules,
    devtool: '#eval-source-map',
    debug: true
}
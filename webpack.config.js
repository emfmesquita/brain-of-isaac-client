const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: "./src/renderer/app.js",
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"]
          }
        }
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.(png|jpe?g|gif)$/,
        use: ["file-loader"]
      }
    ]
  },
  devtool: "cheap-module-eval-source-map",
  resolve: {
    extensions: ["*", ".js", ".jsx"]
  },
  output: {
    path: __dirname + "/build/renderer",
    filename: "app.js"
  },
  plugins: [
    new CopyPlugin([
      { from: "src/renderer/index.html", to: "." },
      { from: "node_modules/brain-of-isaac-commons/public", to: "." }
    ])
  ],
  devServer: {
    contentBase: "./build/renderer"
  }
};

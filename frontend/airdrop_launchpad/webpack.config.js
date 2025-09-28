const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");

module.exports = (env, argv) => {
  const mode = argv.mode || "development";

  const requiredEnv = [
    "INFURA_API_KEY",
    "PRIVATE_KEY",
    "DEBUG",
    "CONTRACT_ADDRESS",
    "COUNTDOWN_HOURS",
    "IMAGE_URL",
    "TOTAL_SUPPLY",
    "TOKEN_PRICE",
    "TOKEN_NAME",
    "TOKEN_SYMBOL"
  ];
  const hours = parseInt(process.env.COUNTDOWN_HOURS || "1", 10);
  const globalEndTime = Date.now() + hours * 3600 * 1000;

  const envKeys = requiredEnv.reduce((acc, key) => {
    acc[`process.env.${key}`] = JSON.stringify(process.env[key] || "");
    return acc;
  }, {});


  envKeys["process.env.END_TIME"] = JSON.stringify(globalEndTime);

  return {
    mode,
    entry: "./src/index.ts",
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "[name].js",
      clean: true,
    },
    resolve: {
      extensions: [".ts", ".js", ".json"],
    },
    module: {
      rules: [
        { test: /\.ts$/, loader: "ts-loader", exclude: /node_modules/ },
        { test: /\.css$/i, use: ["style-loader", "css-loader"] },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: "./src/index.html",
        inject: "body",
      }),
      new webpack.DefinePlugin(envKeys),
    ],
    devServer: {
      static: { directory: path.join(__dirname, "dist") },
      historyApiFallback: true,
      port: 3000,
      open: true,
    },
  };
};

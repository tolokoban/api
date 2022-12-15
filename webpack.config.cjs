const Path = require("path")
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin")
const ShebangPlugin = require("webpack-shebang-plugin")

module.exports = env => {
    const isProdMode = env.WEBPACK_BUILD === true
    if (isProdMode) {
        console.log("+-----------------+")
        console.log("| Production Mode |")
        console.log("+-----------------+")
    }
    return {
        entry: "./src/api.ts",
        output: {
            clean: true,
            filename: "api.cjs",
            path: Path.resolve(__dirname, "dist"),
        },
        devtool: false,
        resolve: {
            extensions: [".ts", ".js", ".json", ".txt", ".html"],
            extensionAlias: {
                ".js": [".ts", ".js"],
            },
            enforceExtension: false,
            alias: {
                "@": Path.resolve(__dirname, "src"),
            },
        },
        target: "node",
        plugins: [
            new ShebangPlugin(),
            new ForkTsCheckerWebpackPlugin({
                typescript: {
                    diagnosticOptions: {
                        semantic: true,
                        syntactic: true,
                    },
                },
            }),
        ],
        module: {
            rules: [
                {
                    test: /\.(ts|js)$/,
                    use: [
                        {
                            loader: "ts-loader",
                            options: {
                                transpileOnly: true,
                                configFile: "tsconfig.json",
                            },
                        },
                    ],
                    exclude: /node_modules/,
                },
                {
                    test: /\.(txt|html)$/,
                    // More information here https://webpack.js.org/guides/asset-modules/
                    type: "asset/source",
                },
            ],
        },
    }
}

// webpack.prod.js
const path = require('path')
const EslintWebpackPlugin = require("eslint-webpack-plugin")
const HtmlWebpackPlugin = require("html-webpack-plugin")
// const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")   //提取css文件
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin")  //压缩css文件
const TerserWebpackPlugin = require("terser-webpack-plugin")   //js 压缩
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin")  //图片压缩
const CopyPlugin = require("copy-webpack-plugin")
const { VueLoaderPlugin } = require("vue-loader")
const { DefinePlugin } = require("webpack")
// 定义返回处理样式loader函数
const getStyleLoaders = (pre) => {
    return [
        MiniCssExtractPlugin.loader, 
        "css-loader", 
        {
            // 处理 css 兼容性问题
            // 需要配合package.json中的browserslist来指定兼容性
            loader: 'postcss-loader',
            options: {
                postcssOptions: {
                    plugins:[ "postcss-preset-env", ]
                },
            },
        },
        pre
    ].filter(Boolean)
}

module.exports = {
    entry: path.join(__dirname, '../src/main.js'),
    output: {
        path: path.resolve(__dirname, '../dist'),
        filename: "static/js/[name].[contenthash:10].js",
        chunkFilename: 'static/js/[name].[contenthash:10].chunk.js',
        assetModuleFilename: 'static/media/[hash:10][ext][query]',
        clean:true,
    },
    module: {
        rules: [
            // 处理css
            {
                test: /\.css$/,
                use: getStyleLoaders()
            },
            {
                test: /\.less$/,
                use: getStyleLoaders("less-loader")
            },
            {
                test: /\.s[ac]ss$/,
                use: getStyleLoaders("sass-loader")
            },
            {
                test: /\.styl$/,
                use: getStyleLoaders("stylus-loader")
            },
           
            // 处理图片
            {
                test:/\.(png|jpe?g|gif|webp|svg)$/,
                type: "asset",
                parser: {
                    dataUrlCondition: {
                        maxSize: 10 * 1024,  // 小于10kb的图片会被base64处理
                    }
                }
            },
            //处理其他资源
            {
                test:/\.(woff2?|ttf)$/,
                type: "asset/resource",
                // 这里说一下 type: "asset/resource" 和上面 type: "asset"的区别
                    // type: "asset" 可以将图片转换为base64
                    // type: "asset/resource" 是将资源原封不动输出
            },
            // 处理js
            {
                test:/\.js$/,
                include: path.resolve(__dirname, "../src"),
                loader: 'babel-loader',
                options: {
                    cacheDirectory: true,
                    cacheCompression: false,
                    // plugins:[
                    //     'react-refresh/babel'   //激活js的 HMR 
                    // ]
                }
            },
            {
                test:/\.vue$/,
                loader: 'vue-loader',
            },
        ],
    },
    // 处理html
    plugins: [
        new EslintWebpackPlugin({
            context: path.resolve(__dirname, "../src"),
            exclude: "node_modules",
            cache: true,
            cacheLocation: path.resolve(__dirname, "../node_modules/.cache/.eslintcache"),
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, "../public/index.html"),
        }),
        // new ReactRefreshWebpackPlugin(),  //激活js的 HMR  解决js的 HMR 功能运行时全局变量问题
        // // 将 public 下面的资源复制到dist目录（除了 index.html）
        new CopyPlugin({
            patterns:[
                {
                    from: path.resolve(__dirname, "../public"),
                    to: path.resolve(__dirname, "../dist"),
                    toType: "dir",
                    noErrorOnMissing: true, //不生成错误
                    globOptions: {
                        // 忽略index.html文件
                        ignore: ["**/index.html"],
                    },
                    info: {
                        // 跳过terser压缩js
                        minimized: true,
                    }
                }
            ]
        }),
        new  VueLoaderPlugin(),
        new DefinePlugin({
            __VUE_OPTIONS_API__:true,
            __VUE_PROD_DEVTOOLS__: false,
        }),
        

        new MiniCssExtractPlugin({
            filename: 'static/css/[name].[contenthash:10].css',
            chunkFilename: 'static/css/[name].[contenthash:10].chunk.css'
        },
        
        )

    ],

  
    optimization: {
        splitChunks: {
            chunks: "all",
        },
        runtimeChunk: {
            name: (entrypoint) => `runtime~${entrypoint.name}.js`,
        },
        minimizer: [
            // 压缩css
            new CssMinimizerPlugin(),
            // 压缩js
            new TerserWebpackPlugin(),
            // 压缩图片
            new ImageMinimizerPlugin({
                minimizer:{
                    implementation: ImageMinimizerPlugin.imageminGenerate,
                    options: {
                        plugins: [
                            ["gifsicle", { interlaced: true }],
                            ["jpegtran", { progressive: true }],
                            ["optipng", { optimizationLevel: 5 }],
                            [
                                "svgo",
                                {
                                    plugins: [
                                        "preset-default",
                                        "prefixIds",
                                        {
                                          name: "sortAttrs",
                                          params: {
                                            xmlnsOrder: "alphabetical",
                                          },
                                        },
                                      ],
                                }
                            ]
                        ]
                    }
                }
            }),

        ]
    },

    // webpack解析模块加载选项
    resolve: {
        // 自动补全文件扩展名
        extensions: [".vue", ".js", ".json"],
    },

    // 自动化设置
    // devServer: {
    //     host: "localhost", // 启动服务器域名
    //     port: 3000,         // 启动服务器端口号
    //     open: true,         // 是否自动打开浏览器
    //     hot: true,    //开启HMR
    //     compress: true,
    //     historyApiFallback: true, //解决 react-router 刷新 404 问题
    // },
    mode: "production",
    devtool: "source-map",
}
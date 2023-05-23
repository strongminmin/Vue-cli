// webpack.dev.js
const path = require('path')
const { DefinePlugin } = require("webpack")
const EslintWebpackPlugin = require("eslint-webpack-plugin")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const { VueLoaderPlugin } = require('vue-loader')
// 定义返回处理样式loader函数
const getStyleLoaders = (pre) => {
    return [
        "vue-style-loader", 
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
        path: undefined,
        filename: "static/js/[name].js",
        chunkFilename: 'static/js/[name].chunk.js',
        assetModuleFilename: 'static/media/[hash:10][ext][query]',
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
                }
            },
            {
                test:/\.vue$/,
                loader:'vue-loader'
            }
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
        // 确保引入这个插件 来施展魔法
        new VueLoaderPlugin(),

        //cross-env 定义的环境变量给打包工具使用
        // DefinePlugin定义的环境变量给源代码使用， 从而解决vue3页面警告的问题
        new DefinePlugin({
            __VUE_OPTIONS_API__:true,
            __VUE_PROD_DEVTOOLS__:false,
        }),

    ],

  
    optimization: {
        splitChunks: {
            chunks: "all",
        },
        runtimeChunk: {
            name: (entrypoint) => `runtime~${entrypoint.name}.js`,
        }
    },

    // webpack解析模块加载选项
    resolve: {
        // 自动补全文件扩展名
        extensions: [".vue", ".js", ".json"],
    },

    // 自动化设置
    devServer: {
        host: "localhost", // 启动服务器域名
        port: 3001,         // 启动服务器端口号
        open: true,         // 是否自动打开浏览器
        hot: true,    //开启HMR
        compress: true,
        historyApiFallback: true, //解决 react-router 刷新 404 问题
    },
    mode: "development",
    devtool: "cheap-module-source-map",

}
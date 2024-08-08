//webpack.config.js
import path from 'path';
import { fileURLToPath } from 'url';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import {CleanWebpackPlugin} from "clean-webpack-plugin";


// 获取当前文件的文件名和目录名
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    resolve: {
        alias:{
            // "./pdf.mjs": path.resolve(__dirname, './src/pdf.js'),
            "pdfjs-lib": path.resolve(__dirname, "./web/src/pdf.js"),
            "pdfjs": path.resolve(__dirname, './web/src/'),
            "fluent-bundle": path.resolve(__dirname,"./node_modules/@fluent/bundle/esm/index.js"),
            "fluent-dom": path.resolve(__dirname,"./node_modules/@fluent/dom/esm/index.js"),
            "cached-iterable": path.resolve(__dirname,"./node_modules/cached-iterable/src/index.mjs"),
            "display-fetch_stream": path.resolve(__dirname,"./web/src/display/fetch_stream.js"),
            "display-network": path.resolve(__dirname,"./web/src/display/network.js"),
            "display-node_stream": path.resolve(__dirname,"./web/src/display/stubs.js"),
            "display-node_utils": path.resolve(__dirname,"./web/src/display/stubs.js"),
            "simple-notify":path.resolve(__dirname,"./node_modules/simple-notify/dist/simple-notify.mjs"),
            "web-alt_text_manager": path.resolve(__dirname,"./web/alt_text_manager.js"),
            "web-annotation_editor_params": path.resolve(__dirname,"./web/annotation_editor_params.js"),
            "web-download_manager": path.resolve(__dirname,"./web/download_manager.js"),
            "web-external_services": path.resolve(__dirname,"./web/genericcom.js"),
            "web-null_l10n": path.resolve(__dirname,"./web/genericl10n.js"),
            "web-pdf_attachment_viewer": path.resolve(__dirname,"./web/pdf_attachment_viewer.js"),
            "web-pdf_cursor_tools": path.resolve(__dirname,"./web/pdf_cursor_tools.js"),
            "web-pdf_document_properties": path.resolve(__dirname,"./web/pdf_document_properties.js"),
            "web-pdf_find_bar": path.resolve(__dirname,"./web/pdf_find_bar.js"),
            "web-pdf_layer_viewer": path.resolve(__dirname,"./web/pdf_layer_viewer.js"),
            "web-pdf_outline_viewer": path.resolve(__dirname,"./web/pdf_outline_viewer.js"),
            "web-pdf_presentation_mode": path.resolve(__dirname,"./web/pdf_presentation_mode.js"),
            "web-pdf_sidebar": path.resolve(__dirname,"./web/pdf_sidebar.js"),
            "web-pdf_thumbnail_viewer": path.resolve(__dirname,"./web/pdf_thumbnail_viewer.js"),
            "web-preferences": path.resolve(__dirname,"./web/genericcom.js"),
            "web-print_service": path.resolve(__dirname,"./web/pdf_print_service.js"),
            "web-secondary_toolbar": path.resolve(__dirname,"./web/secondary_toolbar.js"),
            "web-toolbar": path.resolve(__dirname,"./web/toolbar.js")
        }
    },
    output:{
        filename:"./index.js",
        clean:true,
        path: path.resolve(__dirname, 'dist'),
    },
    entry: './index.js',
    experiments: {
        outputModule: true,
    },

    plugins: [
      new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: './index.html',
            inject :false,
            // scriptLoading: 'module',
        }),
        new CopyWebpackPlugin({
            patterns: [
              { from: 'web/images', to: 'web/images' }, // 复制 /web/images 到 /dist/web/images
              {from:"__init__.py",to:"__init__.py"},
              {from:"web/locale",to:"web/locale"},
              {from:"web/*.html",to:"web/[name][ext]"},
              {from:"pdf_files",to:"pdf_files"},
              // {from:"web/pdf.worker.mjs",to:"web/pdf.worker.mjs"},
              {from:"web/external/bcmaps",to:"web/external/bcmaps"},
            ],
          }),
        new MiniCssExtractPlugin({
            filename: './web/viewer.css',
          }),
    ],
    optimization: {
        minimize: false, // 禁用代码压缩和混淆
      },
    module: {
        rules: [
          {
            test: /\.css$/, // 匹配所有 .css 文件
            use: [MiniCssExtractPlugin.loader, 'css-loader'], // 使用 style-loader 和 css-loader
          },
          {
            test: /\.(png|jpg|gif|svg)$/, // 匹配图片文件
            type: 'asset/resource',
            generator: {
            filename: './web/images/[name][ext][query]', // 指定输出路径和文件名格式
          },
          },
        ],
      },

}

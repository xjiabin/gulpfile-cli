# Gulp 工作流

一个用于构建前端工作流的 gulp 模块

## 基本用法

```sh
npm install gulpfile-cli --save-dev

# 清除目录
gulpfile-cli clean

# 开发服务器
gulpfile-cli develop

# 构建打包
gulpfile-cli build
```

## 配置文件

在项目根目录下创建 pages.config.js 提供自定义配置文件，配置如下

```js
module.exports = {
  // default config
  data: {},
  build: {
    src: 'src',       // 工作目录
    dist: 'release',  // 打包输出目录
    temp: '.tmp',     // 临时工作目录
    public: 'public', // 静态资源文件路径

    paths: {
      styles: 'assets/styles/*.scss',   // 样式文件路径
      scripts: 'assets/scripts/*.js',   // 脚本文件路径
      pages: '*.html',                  // html 页面路径
      images: 'assets/images/**',       // 图片资源路径
      fonts: 'assets/fonts/**',         // 字体资源路径
    }
  }
};
```
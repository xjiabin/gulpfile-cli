// 导入 gulp 文件流操作方法, 任务组合方法 以及文件监听方法
const { src, dest, parallel, series, watch } = require('gulp');

// 文件删除插件
const del = require('del');
// 导入开发服务器插件
const bs = require('browser-sync');

// // 导入 sass 编译插件
// const sass = require('gulp-sass');
// // 导入 babel 编译插件
// const babel = require('gulp-babel');
// // 导入模板编译插件
// const swig = require('gulp-swig');
// // 导入图片压缩插件
// const imagemin = require('gulp-imagemin');

// 导入自动加载插件的 插件
const loadPlugins = require('gulp-load-plugins');
const plugins = loadPlugins();

// 导入页面所需的数据
// const data = require('./data');

// 默认配置
let config = {
  // default config
  data: {},
  build: {
    src: 'src',
    dist: 'release',
    temp: '.tmp',
    public: 'public',

    paths: {
      styles: 'assets/styles/*.scss',
      scripts: 'assets/scripts/*.js',
      pages: '*.html',
      images: 'assets/images/**',
      fonts: 'assets/fonts/**',
    }
  }
};

// 获取当前命令行工作的目录
const cwd = process.cwd();
try {
  // 载入外部配置文件
  const loadConfig = require(`${cwd}/pages.config.js`);
  // 合并配置文件
  config = Object.assign({}, config, loadConfig);

} catch (err) { }

// 清空 dist 文件夹
const clean = () => {
  return del([config.build.dist, config.build.temp])
}

// 样式编译
const style = () => {
  // src: 创建一个文件读取流, 并指定基础路径
  return src(config.build.paths.styles, { base: config.build.src, cwd: config.build.src })
    .pipe(plugins.sass({ outputStyle: 'compact' })) // 导出之前进行 sass 编译, 转化为 css; 基本上每一个插件都是函数, 并会返回一个文件流对象
    .pipe(dest(config.build.temp)) // dest: 创建一个文件写入流
    .pipe(bs.reload({ stream: true })) // 以流的方式推送到浏览器，以更新服务
}

// 脚本编译
const script = () => {
  return src(config.build.paths.scripts, { base: config.build.src, cwd: config.build.src })
    .pipe(plugins.babel({ presets: [require('@babel/preset-env')] }))
    .pipe(dest(config.build.temp))
    .pipe(bs.reload({ stream: true })) // 以流的方式推送到浏览器，以更新服务
}

// 模板页面编译
const page = () => {
  return src(config.build.paths.pages, { base: config.build.src, cwd: config.build.src })
    .pipe(plugins.swig({ data: config.data, defaults: { cache: false } })) // 关闭缓存
    .pipe(dest(config.build.temp))
    .pipe(bs.reload({ stream: true })) // 以流的方式推送到浏览器，以更新服务
}

// 压缩图片
const image = () => {
  return src(config.build.paths.images, { base: config.build.src, cwd: config.build.src })
    .pipe(plugins.imagemin())
    .pipe(dest(config.build.dist))
}

// 字体文件
const font = () => {
  return src(config.build.paths.fonts, { base: config.build.src, cwd: config.build.src })
    .pipe(plugins.imagemin())
    .pipe(dest(config.build.dist))
}

// 将其他文件拷贝只 dist
const extra = () => {
  return src('**', { base: config.build.public, cwd: config.build.public })
    .pipe(dest(config.build.dist))
}

// 开发服务器
const serve = () => {
  // 监听开发文件变化
  watch(config.build.paths.styles, { cwd: config.build.src }, style);
  watch(config.build.paths.scripts, { cwd: config.build.src }, script);
  watch(config.build.paths.pages, { cwd: config.build.src }, page);

  // 开发阶段无需 压缩图片，以优化开发构建效率
  // watch('src/assets/images/**', image);
  // watch('src/assets/fonts/**', font);
  // watch('public/**', extra);

  // 开发阶段监听 图片变化，重启服务
  watch([
    config.build.paths.images,
    config.build.paths.fonts
  ], { cwd: config.build.src }, bs.reload);

  watch('**', { cwd: config.build.public }, bs.reload)

  bs.init({
    notify: false, // 关闭浏览器热更新后右上角弹出的提示
    port: 2080, // 服务端口
    open: true, // 开启服务后是否自动打开浏览器
    server: {
      baseDir: [ // 可以将路径指定为数组，请求的时候如果没有在当前目录下匹配到文件，会一个个往后找。
        config.build.temp,
        config.build.src,
        config.build.public
      ],
      routes: { // 路由配置, 这里的路由匹配优先于 baseDir的配置
        '/node_modules': 'node_modules', // 将 /node_modules 路径重写为 node_modules
      }
    }
  })
}

// 处理 资源引用
const useref = () => {
  return src(config.build.paths.pages, { base: config.build.temp, cwd: config.build.temp })
    // searchPath: 在哪里寻找需要合并的文件
    .pipe(plugins.useref({ searchPath: [config.build.dist, '.'] }))
    // 对文件进行操作: html js css
    // 匹配 js 文件，使用 uglify 进行压缩
    .pipe(plugins.if(/\.js$/, plugins.uglify()))
    // 匹配 css 文件， 使用 clean-css 压缩
    .pipe(plugins.if(/\.css$/, plugins.cleanCss()))
    // 匹配 html 文件， 使用 clean-css 压缩
    .pipe(plugins.if(/\.html$/, plugins.htmlmin({
      collapseWhitespace: true,
      minifyCSS: true,
      minifyJS: true
    })))
    .pipe(dest(config.build.dist))
}

// 组合所有编译任务, 并行执行, 不分先后
const compile = parallel(style, script, page);

// 组合任务（打包上线任务）
const build = series(
  clean,
  parallel(
    series(compile, useref),
    extra,
    image,
    font
  )
)

// 组合任务（开发阶段的任务）
const develop = series(compile, serve);

// 导出任务模块
module.exports = { build, develop, clean }

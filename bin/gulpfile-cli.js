#!/usr/bin/env node

// console.log('gulpfile-cli working');

// gulp --gulpfile xxx/xxx/gulpfile.js --cwd xxx

// 添加 --cwd 参数
process.argv.push('--cwd');
// 添加 工作路径
process.argv.push(process.cwd());
// 添加 --gulpfile 参数
process.argv.push('--gulpfile');
// 添加 gulpfile 文件路径
// require.resolve() 方法用于找到这个模块所对应的路径  
// .. 会自动去 package.json 中寻找 main 字段，取其值作为 resolve 的路径
// process.argv.push(require.resolve('..'));
process.argv.push(require.resolve('../lib/index.js'));

// 引入 gulp 执行文件，自动执行 gulp-cli 命令
require('gulp/bin/gulp');
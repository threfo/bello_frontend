# bello_frontend

## 说明

本项目使用 git submodule + lerna 管理的 基于 qiankun 的微前端项目

如果对以上知识点不了解，请先阅读`学习资料`的相关模块先建立起初步认知

## Start up

### 公共组件/包开发

### 子项目开发

使用 `git clone` 本项目下来的之后，你会发现 `projects` 内的子项目都是空文件，这个时候你需要把子项目的代码下载才可以方便开发。当然你也可以单独的 `git clone` 子项目进行开发，但是这样会没那么方便，也享受不了集合开发的方便性

```bash
git submodule init # 初始化子项目

git submodule update # 下载所有的子项目
```

## 常用命令

### 添加 `packages` 项

```bash
lerna create packages-name #packages-name 要添加的 package 名字
```

`packages-name` 建议带 `bello-` 前缀

### 添加 packages 内的依赖

```bash
lerna add lodash --scope=utils #添加 lodash 到 utils
```

注意 `lerna add` 只能一个一个依赖添加，`--scope=` 不指定则全部都添加

`--scope=` 后的指定的包不是文件夹名字，而是里面的 `package.json` 内的 `name`

### 添加新的 git submodule

```bash
git submodule add git@github.com:threfo/subapp_vue_demo.git projects/subapp_vue_demo
```

### 发布 packages

```bash
lerna publish
```

发布权限 找 晓辉在 npm 的 belloai group 中把你添加进去

### 学习资料

- [Git 中 submodule 的使用](https://zhuanlan.zhihu.com/p/87053283)
- [git-submodule 官方文档](https://git-scm.com/docs/git-submodule)
- [使用 Lerna 构建项目](https://github.com/threfo/mfe_showcase/blob/leason_1_lerna/doc/leason_1_lerna.md)
- [用 GitHub Actions 实现自动发布 NPM 包](https://www.jianshu.com/p/fe4691bab958)

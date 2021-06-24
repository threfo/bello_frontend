# bello_frontend

## 说明

本项目使用 git submodule + lerna 管理的 基于 qiankun 的微前端项目

如果对以上知识点不了解，请先阅读`学习资料`的相关模块先建立起初步认知

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

### 学习资料

- [Git 中 submodule 的使用](https://zhuanlan.zhihu.com/p/87053283)

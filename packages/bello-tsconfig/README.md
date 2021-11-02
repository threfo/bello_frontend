# Bello Typescript Config

该 [tsconfig.json](./tsconfig.json) 适用于 vue 项目

## 安装

`yarn add @belloai/bello-tsconfig -D` or `npm i @belloai/bello-tsconfig --dev`

## 使用

```json
// ./tsconfig.json
{
  "extends": "@belloai/bello-tsconfig",
  "compilerOptions": {
    "baseUrl": "."
  },
  "include": ["src"]
}
```

```json
// ./settings.json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib", //支持css 类型检测配置
  "typescript.enablePromptUseWorkspaceTsdk": true //支持css 类型检测配置
}
```

[tsconfig.json](./tsconfig.json) 内容

### 更多 ts 的详细学习

- [TypeScript 中文手册](https://typescript.bootcss.com/tsconfig-json.html)
- [TypeScript 官方文档](https://www.typescriptlang.org/docs/)

用于检查第三方库的 types

```bash
npm install typings -g
```

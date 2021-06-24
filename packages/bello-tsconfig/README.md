# Bello Typescript Config

该 [tsconfig.json](./tsconfig.json) 适用于 vue 项目

## 安装

`yarn add @bello/bello-tsconfig -D` or `npm i @bello/bello-tsconfig --dev`

## 使用

```json
// ./tsconfig.json
{
  "extends": "@bello/bello-tsconfig",
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

```json
{
  "compilerOptions": {
    "target": "esnext",
    "module": "esnext",
    "strict": true,
    "jsx": "preserve",
    "importHelpers": true,
    "moduleResolution": "node",
    "experimentalDecorators": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "sourceMap": true,
    "noImplicitAny": false, // 后期需要删除 https://daief.tech/2018-09-04/declaration-files-of-typescript.html
    "baseUrl": ".",
    "types": ["jest"],
    "paths": {
      "@/*": ["src/*"]
    },
    "lib": ["esnext", "dom", "dom.iterable", "scripthost"]
  }
}
```

### 更多 ts 的详细学习

- [TypeScript 中文手册](https://typescript.bootcss.com/tsconfig-json.html)
- [TypeScript 官方文档](https://www.typescriptlang.org/docs/)

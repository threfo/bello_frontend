# Bello 前端 vue 项目代码规范 `eslint-config-vue-prettier-ts`

## 依赖库

- Eslint
- Vue
- Prettier
- Typescript

## 安装

- `npm i @belloai/eslint-config-vue-prettier-ts --dev` or
- `yarn add @belloai/eslint-config-vue-prettier-ts -D`

> 使用 yarn 如果出现错误的话 需要补充安装 `yarn add eslint-plugin-prettier@latest -D`

## 配置

- 在 `.eslintrc.js` 中加入 :

```javascript
module.exports = {
  extends: ['@belloai/eslint-config-vue-prettier-ts']
}
```

[index.js](./index.js) 内容

### 学习资源

- [eslint shareable-configs 官方文档](https://eslint.org/docs/developer-guide/shareable-configs)
- [eslint shareable-configs 官方文档(中文)](http://eslint.cn/docs/developer-guide/shareable-configs)

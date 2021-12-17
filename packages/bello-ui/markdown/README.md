# 通过 JSON 构建界面

针对一些简单的界面可以考虑使用该组件来完成，比较复杂的话，就不太建议了

具体调用看[mock.ts](./mock.ts)

已经定义为全局组件

其他实战例子

- [人才库-画像分析相关弹窗](../../views/resume-manage/components/AnalyseMode/dailog/createDialog.ts)

## 有一些方法

在[](../../utils/transform)下面的各个模块的 `jsoncomp.ts` 中已经封装好的一些生成 `jsoncomponent` 使用数据的方法，如果你发现里面没有你要的，你需要的那个展示行为又相对通用，那么请把你处理的内容进行抽象，加入到 transform 的大家庭中吧

## 有一说一

不要往这个组件里面加入任何业务组件！！！！！！！！

<demo />

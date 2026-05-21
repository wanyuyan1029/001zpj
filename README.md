# 随机转盘微信小程序

这是一个原生微信小程序示例，核心功能是一个可配置选项和百分比权重的随机转盘。

## 功能

- 添加、删除转盘选项
- 修改每个选项名称
- 修改每个选项中奖百分比
- 自动校验百分比总和是否为 100
- 按百分比权重随机抽取结果
- 使用 Canvas 绘制转盘，并通过旋转动画展示抽取过程

## 使用

1. 打开微信开发者工具。
2. 导入当前目录 `E:\cpt`。
3. 进入首页后编辑选项与百分比。
4. 确保百分比合计为 `100%`，点击“开始抽取”。

## 文件结构

```text
app.json
app.js
app.wxss
project.config.json
sitemap.json
pages/index/index.wxml
pages/index/index.wxss
pages/index/index.js
pages/index/index.json
```

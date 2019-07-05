module.exports = {
  defaultType: 'string',
  supported: [
    'String', // 字符串
    'Image', // 图片
    'Number', // 数字
    'Date', // 日期
    'URL', // url
    'Boolean', // 布尔值
    'RichText', // 富文本
    'Text', // 文本
    'Color', // 颜色
    'Enum', // 下拉选择
    'Component', // 组件数据
    'Box', // 盒子，对于运营为一个可拖拽区域，对于开发者是一组css样式
    'File', // html 文件
    'Resource', // 通用自定义类型
    'Plugin', // 插件
  ],
};
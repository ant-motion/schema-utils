module.exports = function(conf) {
  var desc = conf.description;
  var size = desc.match(/(\d+)[x*](\d+)/);
  if (size && size.length === 3) {
    size = size[1] + 'h_' + size[2] + 'w';
  } else {
    size = '300h_300w';
  }
  return 'https://zos.alipayobjects.com/rmsportal/rlwtYjJzVWGXXhz.png@' + size;
};


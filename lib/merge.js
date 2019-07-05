'use strict';

var assign = require('object-assign');
var isObject = require('lodash.isplainobject');

function isArray(arr) {
  return Array.isArray(arr);
}

function _tryMerge(to, from, object2array) {
  if (object2array) {
    // 尝试对象转数组，复制多个 object 给每个 array 项
    return to.map(function(to_items) {
      return merge(to_items, from)[0];
    });
  } else {
    // 尝试数组转对象，取 from 的第一个进行合并
    return merge(to, from[0])[0];
  }
}

function _merge2Array(to, from) {
  var from_is_object = isObject(from);
  var from_is_array = isArray(from);

  var ret;
  var conflict;
  if (from_is_array) {
    // 以 from 数组个数为准
    ret = from.map(function(from_items, idx) {
      // form 的个数超过 to 的话，取 to 的第一个
      var to_items = to[idx] || to[0];
      // 如果 to_items 没有，则以 from_items 为准
      if (!to_items) {
        return from_items;
      }
      // 递归合并子数据项
      var result = merge(to_items, from_items);
      if (result[1]) {
        if (!isObject(conflict)) {
          conflict = {};
        }
        conflict[idx] = result[1];
      }
      return result[0];
    });
  } else if (from_is_object) {
    // 类型冲突：object -> array
    conflict = ['object', 'array'];
    ret = _tryMerge(to, from, true);
  } else {
    // 类型冲突：string|number|boolean -> array
    conflict = ['string|number|boolean', 'array'];
    ret = to;
  }
  return [ret, conflict];
}

function _merge2Object(to, from) {
  var from_is_object = isObject(from);
  var from_is_array = isArray(from);

  var ret;
  var conflict;
  if (from_is_object) {
    // 字段以 to 中的为准
    ret = assign({}, to);
    Object.keys(ret).forEach(function(key) {
      // 考虑嵌套的情况
      var result = merge(ret[key], from[key]);
      if (result[1]) {
        if (!isObject(conflict)) {
          conflict = {};
        }
        conflict[key] = result[1];
      }
      ret[key] = result[0];
    });
  } else if (from_is_array) {
    // 类型冲突：array -> object
    conflict = ['array', 'object'];
    ret = _tryMerge(to, from);
  } else {
    // 类型冲突：string|number|boolean -> object
    conflict = ['string|number|boolean', 'object'];
    ret = to;
  }
  return [ret, conflict];
}

function _merge2Simple(to, from) {
  var from_is_object = isObject(from);
  var from_is_array = isArray(from);

  var ret;
  var conflict;
  if (from_is_array || from_is_object) {
    // 类型冲突：array|object -> string|number|boolean
    conflict = ['array|object', 'string|number|boolean'];
    // 直接使用 to
    ret = to;
  } else {
    // 否则使用 from，但需要类型统一成 to 的
    var type = typeof to;
    ret = from !== undefined ? from : to;
    if (type === 'boolean') {
      ret = !!ret;
    } else if (type === 'number') {
      ret = parseFloat(ret) || to;
    } else {
      ret = '' + ret;
    }
  }
  return [ret, conflict];
}

function merge(to, from) {
  var to_is_object = isObject(to);
  var to_is_array = isArray(to);

  if (to_is_array) {
    return _merge2Array(to, from);
  } else if (to_is_object) {
    return _merge2Object(to, from);
  } else {
    return _merge2Simple(to, from);
  }
}

module.exports = merge;
module.exports.isCompatible = function(to, from) {
  if (merge(to, from)[1]) {
    return false;
  } else {
    return true;
  }
};

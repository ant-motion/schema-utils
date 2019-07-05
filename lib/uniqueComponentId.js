'use strict';
var uuid = require('uuid');

function uniqueComponentId(data, schema, ids) {
  ids = ids || new Map();
  if (!schema) {
    return;
  }

  if (schema.type === 'array') {
    if (!Array.isArray(data)) {
      return;
    }

    data.map(function(item) {
      uniqueComponentId(item, { properties: schema.properties }, ids);
    });

    var keys = [];
    ids.forEach(function(val, key) {
      keys.push(key);
    });

    return keys;
  }

  var props = schema.properties;
  Object.keys(props).map(function(key) {
    var type = props[key].type;

    if (type === 'component') {
      var id = data[key];
      if (!ids.has(id)) {
        return ids.set(id, 1);
      }

      var index = ids.get(id) + 1;
      var newId = id + index;
      // 保证新插入的 id 一定没有出现过
      while (ids.has(newId)) {
        index += 1;
        newId = id + index;
      }

      ids.set(id, index);
      ids.set(newId, 1);
      // 修改数据为新生成的 id
      data[key] = newId;
    }

    if (type === 'box') {
      if (!data[key].uid) {
        data[key].uid = uuid.v4();
      }
    }

    if (type === 'array' || type === 'object') {
      return uniqueComponentId(data[key], props[key], ids);
    }
  });
}

module.exports = uniqueComponentId;

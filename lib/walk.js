/**
 * walk schema every property
 * @param {object} schema json schema object
 * @param {function} fn method for run
 * @return {object}
 */
module.exports = function walk(schema, fn, key) {
  if (typeof fn !== 'function') {
    throw new Error('fn must be function');
  }

  var ret = {};
  var type = schema.type;
  if (type === 'object' || type === 'array') {
    Object.keys(schema.properties).forEach(function(prop) {
      ret[prop] = walk(schema.properties[prop], fn, prop);
    });
    // 这里接口有点蛋疼
    // 第四个参数传递 schema, 第一个 类型
    return fn(type, ret, key, schema);
  }

  return fn(schema, null, key);
};

/**
 * mock json schema data
 */
var assign = require('object-assign');
var walk = require('../walk');

function uid() {
  return Math.random().toString(36).slice(2, 14);
}

var defaultConfig = {
  array: { size: 2 },
  boolean: false,
  url: 'https://www.alipay.com',
  number: '0',
  color: '#ff00ff',
  box: {
    left: 10,
    top: 10,
    width: 60,
    height: 30
  },
  enum: function(conf) {
    if (conf.items.length) {
      return conf.items[0].value;
    }
    return conf.description;
  },
  date: function() {
    return (new Date()).getTime();
  },
  component: function() {
    return '_component_' + uid();
  },
  image: require('./image'),
  // 资源数据
  resource: {
    bizId: '12313',
    data: {},
  },

  // 插件
  plugin: {
    id: '111',
    pluginId: 'PLG123',
    originId: '1234567890',
    data: {},
  },
};

module.exports = function mock(schema, config, rules) {
  config = assign({}, defaultConfig, config);

  return walk(schema, function(type, data, key, o) {
    if (typeof type === 'string') {
      if (type === 'array') {
        var len = config.array.size || 1;
        var ret = [];

        for (var i = 0; i < len; i++) {
          ret.push(assign({}, data));
        }

        return ruleData(ret, o.meta, rules);
      } else {
        return ruleData(data, o.meta, rules);
      }
    }
    // 用户设的 默认值 优先
    var defaultValue = undefined;

    var meta = type.meta;
    if (meta && meta.defaultValue !== undefined) {
      defaultValue = meta.defaultValue;
    }
    if (meta && meta.default !== undefined) {
      defaultValue = meta.default;
    }
    if(defaultValue !== undefined) {
      return ruleData(defaultValue, meta, rules);
    }

    var val = config[type.type];
    if (typeof val === 'function') {
      val = val(type);
    }

    return ruleData(val === undefined ? type.description : val, meta, rules);
  });
};

/**
 * 返回和规则相关的数据，如果 meta 或者 rules 为空，直接返回原来的 value
 */
function ruleData(value, meta, rules) {
  var ret = value;

  if (meta && meta.rule && rules && rules[meta.rule]) {
    var rule = rules[meta.rule];
    ret = {};
    Object.keys(rule).map(function(key) {
      ret[key] = value;
    });
  }

  return ret;
}



'use strict';

var parse = require('../parse/schema').parse;
var defaultConfig = require('./types');
var walk = require('./walk');

function toLowerCase(string) {
  return string.toLowerCase();
}

function schema(str, checkLevel) {
  var supported = defaultConfig.supported;
  var defaultType = defaultConfig.defaultType;

  var types = {
    defaultType: defaultType,
    // 支持的数据类型，变成一个Set，同时字母统一使用小写
    supported: new Set(supported.map(toLowerCase))
  };

  // 获得ast语法树
  var asts = parse(str);
  var json = {};

  // export 语法
  if (Array.isArray(asts)) {
    asts.forEach(function (ast) {
      json[ast.key] = createSchema(ast.schema, types, checkLevel);
    });
  } else {
    json = createSchema(asts, types, checkLevel);
  }

  // 特殊逻辑的检测，不支持会抛异常
  if (checkLevel) {
    _check_nest(json, checkLevel);
    _check_rules(json);
  }

  return json;
}

function _processMeta(type, meta) {
  var item;

  // 将 meta 的数组转换成 JSON 对象
  if (meta && meta.length > 0) {
    item = {};
    meta.forEach(function (m) {
      item[m.key] = m.value;
    });
  }
  return item;
}

/**
 * 生成schema
 */
function createSchema(prop, types, checkLevel) {
  var json = {
    type: prop.type,
    description: prop.description,
    properties: property(prop.props, types)
  };
  var meta = _processMeta(prop.type, prop.meta);
  if (meta) {
    json.meta = meta;
  }

  if (prop.lottery) {
    json.lottery = true;
    if (checkLevel) {
      check_lottery(json);
    }
  }

  if (prop.public) {
    json.public = true;
  }

  return json;
}

/**
 * Lottery 的校验
 * @param json
 * @returns {*}
 */
function check_lottery(json) {
  var props = json.properties;
  if (!props.flag || props.flag.type !== 'string') {
    throw new Error('抽奖配置必须有 flag 字段, 并且 type 是字符串');
  }

  if (!props.success || props.success.type !== 'array') {
    throw new Error('抽奖配置必须有 success 字段, 并且 type 是数组');
  }
  var successProps = props.success.properties;
  if (!successProps.prizeId || successProps.prizeId.type !== 'string') {
    throw new Error('抽奖的 success 配置必须有 prizeId 字段, 并且 type 是字符串');
  }
  if (!successProps.prizeText || successProps.prizeText.type !== 'string') {
    throw new Error('抽奖的 success 配置必须有 prizeText 字段, 并且 type 是字符串');
  }

  if (!props.error || props.error.type !== 'array') {
    throw new Error('抽奖配置必须有 error 配置, 并且 type 是数组');
  }
  var errorProps = props.error.properties;
  if (!errorProps.code || errorProps.code.type !== 'string') {
    throw new Error('抽奖的 error 配置必须有 code 字段, 并且 type 是字符串');
  }
  if (!errorProps.codeText || errorProps.codeText.type !== 'string') {
    throw new Error('抽奖的 error 配置必须有 codeText 字段, 并且 type 是字符串');
  }
}

/*
 * Schema 限制有以下两种模式:
 *
 * 1. 支持数据结构嵌套的 schema 限制
 *   - 根据参数传入的 `checkLevel` 限制嵌套层级(默认 2)
 * 2. 不支持数据结构嵌套的 schema 限制
 *   - array 不能嵌套 array
 *   - array 不能嵌套 object
 *   - object 不能嵌套 object
 *   - object 不能嵌套 > 1 的 array 嵌套
 */
function _check_nest(json, checkLevel) {
  var isOldType = checkLevel === true;
  checkLevel = typeof checkLevel === 'number' ? checkLevel : 2;
  var level = 1;

  function getLevel(json, level) {
    var oldLevel = level;
    Object.keys(json.properties || {}).map(function (key) {
      var type = json.properties[key].type;

      // 保持老的逻辑
      if (isOldType) {
        if ((type === 'array' || type === 'object') && json.type === 'array') {
          throw new Error('数组不支持嵌套数组和对象');
        } else if (type === 'object') {
          throw new Error('对象只支持一级嵌套数组');
        }
      }

      if (type === 'object' || type === 'array') {
        if (level === oldLevel) {
          level += 1;
          if (level > checkLevel) {
            throw new Error('最多' + checkLevel + '层嵌套');
          }
        }
        getLevel(json.properties[key], level);
      }
    });
  }

  getLevel(json, level);
}
/**
 * - 每个 schema 只能设定一个 rule
 * @param json
 */
function _getRules(json) {
  var rule_list = {};
  walk(json, function (def, o) {
    if (def.meta && def.meta.rule) {
      rule_list[def.meta.rule] = true;
    }
  });
  return Object.keys(rule_list);
}

function _check_rules(json) {
  if (json.type === 'object' || json.type === 'array') {
    if (json.meta && json.meta.rule) {
      // 有总的 rule 配置时，子字段不能设置 rule
      Object.keys(json.properties).forEach(function (prop) {
        var rule_list = _getRules(json.properties[prop]);
        if (rule_list.length) {
          throw new Error('不能嵌套设置 rule');
        }
      });
    } else {
      // 子字段只能设定一个 rule
      var rule_list = _getRules(json);
      if (rule_list.length > 1) {
        throw new Error('一个 schema 只能定义一种规则');
      }
    }
  }
}

function createEnum(prop) {
  var ret = {
    type: prop.type,
    description: prop.description,
    items: prop.items.map(function (item) {
      return {
        label: item.description,
        value: item.key
      };
    })
  };
  var meta = _processMeta(prop.type, prop.meta);
  if (meta) {
    ret.meta = meta;
  }
  return ret;
}

function property(props, types) {
  var properties = {};
  props.map(function (prop) {
    var path = prop.path;
    var key = prop.key;
    var meta;

    if (prop.type) {
      if (prop.type === 'enum') {
        return properties[key] = createEnum(prop);
      }

      properties[key] = {
        type: prop.type,
        description: prop.description,
        properties: property(prop.props, types)
      };
      meta = _processMeta(prop.type, prop.meta);
      if (meta) {
        properties[key].meta = meta;
      }
      return;
    }

    var type = getType(path, types);
    properties[key] = {
      type: type,
      description: prop.description
    };
    meta = _processMeta(type, prop.meta);
    if (meta) {
      properties[key].meta = meta;
    }
  });
  return properties;
}

function getType(path, types) {
  if (!path || !path.length) {
    return types.defaultType;
  }

  var ret = null;
  path.some(function (type) {
    type = type.toLowerCase();
    if (types.supported.has(type)) {
      ret = type;
      return true;
    }
  });

  return ret || types.defaultType;
}

module.exports = schema;

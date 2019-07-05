'use strict';
var walk = require('./walk');

function csv(json, data) {
  var header = getHeader(json);

  var rows = [];
  if (!Array.isArray(header)) {
    throw new Error('Only array type supported');
  }
  header = header[0];

  var keys = Object.keys(header);
  rows.push(keys.map(getKey.bind(null, header)));

  data.map(function(item) {
    rows.push(keys.map(getKey.bind(null, item)));
  });

  return rows;
}

csv.read = function(json, data) {
  var props = json.properties || {};
  var header = getHeader(json);
  if (!Array.isArray(header)) {
    throw new Error('schema must define an array type');
  }
  header = header[0];

  var row = {};
  var headerKeys = Object.keys(header);

  headerKeys.map(function(key) {
    row[header[key]] = key;
  });
  var keys = data[0].map(function(desc) {
    if (row[desc]) {
      return row[desc];
    }
  });

  var misskeys = headerKeys.filter(function(o) {
    return keys.indexOf(o) === -1;
  }) || [];

  return data.slice(1).map(function(item) {
    var ret = {};
    item.map(function(val, i) {
      var key = keys[i];
      if (!key) {
        return;
      }

      var type = props[key] && props[key].type;
      if (type === 'box') {
        try {
          ret[key] = JSON.parse(val);
        } catch (e) {
          ret[key] = val;
        }
      } else if (type === 'number') {
        ret[key] = parseInt(val, 10);
        // isNaN falll back
        if (ret[key] !== ret[key]) {
          ret[key] = val;
        }
      } else if (type === 'boolean') {
        if (typeof val === 'string') {
          val = val.toUpperCase() === 'TRUE' ? true : false;
        }
        ret[key] = !!val;
      } else {
        ret[key] = val;
      }
    });

    misskeys.map(function(key) {
      ret[key] = '';
    });
    return ret;

  });
};


function getHeader(json) {
  var header = walk(json, function(def, o) {
    if (def === 'array') {
      return [o];
    } else if (def === 'object') {
      return o;
    }

    return def.description;
  });
  return header;
}

function getKey(o, key) {
  return o[key] !== undefined ? o[key] : '';
}

module.exports = csv;

'use strict';

var compareSchemaItem = function compareSchemaItem(oldDataItem, oldPropertiesItem, newDataItem, newPropertiesItem) {
  // newPropertiesItem一定存在
  var oldDataItemType = oldPropertiesItem && oldPropertiesItem.type;
  var newDataItemType = newPropertiesItem.type;
  /**
   * 1.数组的元素
   * 2.array || object
   * 3.oldDataItemType undefined
   * 4.其它
   */
  if (!newDataItemType) {
    var innerMergedData = {};
    for (var key in newPropertiesItem) {
      if (newPropertiesItem.hasOwnProperty(key)) {
        var innerMergedDataItem = compareSchemaItem(
          oldDataItem[key],
          oldPropertiesItem[key],
          newDataItem[key],
          newPropertiesItem[key]
        );
        innerMergedData[key] = innerMergedDataItem;
      }
    }
    return innerMergedData;
  }
  if (
    (oldDataItemType === 'array' && oldDataItemType === newDataItemType) ||
    (oldDataItemType === 'object' && oldDataItemType === newDataItemType)
  ) {
    return formatOldDataWithNewSchema(newDataItem, newPropertiesItem, oldDataItem, oldPropertiesItem);
  }
  if (!oldDataItemType) {
    return newDataItem;
  }
  return oldDataItem;
};

// 以newSchema为准，从oldData和newData中pick
var formatOldDataWithNewSchema = function formatOldDataWithNewSchema(newData, newSchema, oldData, oldSchema) {
  var oldDataType = oldSchema.type;
  var newDataType = newSchema.type;
  // 类型不一致 || (!array && !object): 按照现在的方案(不改动用户数据)，这里暂时以原数据为准
  if (oldDataType !== newDataType || (oldDataType !== 'array' && oldDataType !== 'object')) {
    return oldData;
  }

  /**
   * 下面两种情况，说明schema是存在的，但是注意，schemaData可能不一定
   * 1.array
   * 2.object
   */
  var mergedData;
  var mergedDataItem;
  var oldProperties = oldSchema.properties;
  var newProperties = newSchema.properties;

  /**
   * 如果oldData为undefined，可能是营销同学没有修改 / 模板本身可能没有 / 之前升级站点没有做过merge，设置为newData即可
   * 如果newData为undefined，开发同学的模板中没有该schemData，保持原来的数据oldData
   */
  if (!oldData) {
    mergedData = newData;
  } else if (!newData) {
    mergedData = oldData;
  } else {
    if (newDataType === 'array') {
      mergedData = [];
      // 如果无mock schema数据(newData)，则无法对oldData做处理了，直接将oldData置为空
      if (newData.length > 0) {
        for (var i = 0, len = oldData.length; i < len; i++) {
          mergedDataItem = compareSchemaItem(oldData[i], oldProperties, newData[i] || newData[0], newProperties);
          mergedData.push(mergedDataItem);
        }
      }
    } else {
      mergedData = {};
      for (var key in newProperties) {
        if (newProperties.hasOwnProperty(key)) {
          mergedDataItem = compareSchemaItem(oldData[key], oldProperties[key], newData[key], newProperties[key]);
          mergedData[key] = mergedDataItem;
        }
      }
    }
  }

  return mergedData;
};

module.exports = formatOldDataWithNewSchema;

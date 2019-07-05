schema util
-----------

[![build status](http://gitlab-ci.alipay-inc.com/projects/149/status.png?ref=master)](http://gitlab-ci.alipay-inc.com/projects/149?ref=master)

依赖 schema-util 的应用列表:

-	[fengdie / papilio-tools](http://gitlab.alipay-inc.com/fengdie/papilio-tools)
-	[fengdie / papilio-package](http://gitlab.alipay-inc.com/fengdie/papilio-package)
-	[fengdie / fengdie-web](http://gitlab.alipay-inc.com/fengdie/fengdie-web)

## Badges

[![TNPM version][tnpm-image]][tnpm-url]
[![TNPM downloads][tnpm-downloads-image]][tnpm-url]
[![install size][install-size-image]][install-size-url]

[tnpm-image]: https://npm.alibaba-inc.com/badge/v/schema-util.svg
[tnpm-url]: https://npm.alibaba-inc.com/package/schema-util
[tnpm-downloads-image]: https://npm.alibaba-inc.com/badge/d/schema-util.svg
[install-size-image]: http://npg.dockerlab.alipay.net/badge?p=schema-util
[install-size-url]: http://npg.dockerlab.alipay.net/result?p=schema-util

--------------------

### schema dsl parse

```js
var schema = require('schema-util').schema;

var json = schema(`
  Array(foo) {
    href(href),
    title(title),
    img(image url): Image,
    amount(money amout)
  }
`);
// json should be so:
/**
  {
    type: 'array',
    description: 'foo',
    properties: {
      href: { description: 'href', type: 'string' },
      title: { description: 'title', type: 'string' },
      img: { description: 'image url', type: 'image' },
      amount: { description: 'money amount', type: 'string' }
    }
  }
*/
```

And nest rule supported:

```
var json = schema(`
  Object(abc) {
    title(title),
    user(user): Object {
      name(user name),
      age(user age): Number
    }
  }
`, ['number']);
```

The secend argument, you can add some more type support, such as`age.number`, `background.color`.

```
schema(`Array(foo) { a(a)}`, types)
```

The defaultType is 'string', If you want change this, you need send the secend argument like this:

```
schema(`Array(foo) { a(a)}`, {
  defaultType: 'number',
  supported: ['string']
});
```

#### export support

Write code like this example, you can get a object, which have to properties a and b. Each property have the value of schema object.

```
schema(`
  export a Object(hello) { ... }

  export b Array(hello b) { ... }
`);
```

### mock

mock schema data

```
mock(schema, config)
```

config can set default type value, for example, config set to { image: 'xx.png' }, then schema mock image type value will be xx.png.

config value can be an function.

### walk

walk every property of schema.

### merge

merge old / new datas.

### formatOldDataWithNewSchema

format old data with new schema
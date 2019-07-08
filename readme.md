schemas utile
-----------


## Badges

[![NPM version][npm-image]][npm-url]
[![npm download][download-image]][download-url]

[npm-image]: http://img.shields.io/npm/v/schemas-utile.svg?style=flat-square
[npm-url]: http://npmjs.org/package/schemas-utile
[download-image]: https://img.shields.io/npm/dm/schemas-utile.svg?style=flat-square
[download-url]: https://npmjs.org/package/schemas-utile
--------------------

### schema dsl parse

```js
var schema = require('schemas-utile').schema;

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
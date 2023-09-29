## Migrate to 3.0+

Modelar 3.0+ is written in TypeScript, but you can still use pure JavaScript 
with it. For some reason, since 3.0, those public properties is no longer 
started with a prefix `_`, e.g. `model._data` is now `model.data`, but for
compatible to 2.X, old property names are still working, though you should 
avoid using them in your code form now on.

And there is a incompatible change, in the new version, `query.table` replaced
the `query._table`, where in the old version, `query.table()` is a method. 
That means if you want to run the code based on 2.X, you must change all 
locations that used `query.table()` in your code.

Also, version 2.X allows you import `Model` in the following way:

```javascript
const Model = require("modelar");
```

But since 3.0, this is no longer supported, must change it to:

```javascript
const { Model } = require("modelar");
```

This is not a compatible change, if you used it in you old code, you must 
change it to the new way.

Another change is the iterator implementation, in 2.X you could use the 
following way to walk through a model's data:

```javascript
for (let [key, value] of model) {
    // ...
}
```

Since 3.0, this feature is now fixed to:

```javascript
for (let { key, value } of model) {
    // ...
}
```

To be compatible to 2.X code, you can set `Model.oldIterator` to `true` to use
old iterator, but it will trigger a warning, you should use the new way 
instead.

**Since version 3.0.4, old style of iterator is not longer supported.**

## Migration from 1.X to 2.0+

Modelar 2.0 changed some details of the core, thus programs written with 1.X 
won't be work with 2.0+, If you want to migrate, following this tutorial, it 
won't hard.

Modelar 2.0 doesn't changed to much, but it now extends the Node.js 
`EventEmitter`, so does the style of `protected properties`. In 1.X, those 
properties are start with two underscores (`__` in ordinary JS way), but in 
2.X, it follows the Node.js way and start with only one underscore (`_`).

Most of those properties you may not have touched except the `__data`, which 
is `_data` now. Whatever and however you used those properties, just change 
your code, modify the properties start with `__` to `_`, and that will be just
fine.

Not only properties, so are methods, if you used any protected methods in your 
code, modify them too.

One last thing is the method `table.foreignKey()` comes from `Table` class, 
now its parameter sequence is changed to `(table, field, onDelete, onUpdate)`,
which is originally `(table, field, onUpdate, onDelete)`, if you used this 
method in your program, change it to the new way.
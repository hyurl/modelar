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
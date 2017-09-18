### model.belongsToVia()

*Defines a belongs-to (many) association via a pivot table.*

**parameters:**

- `Model` A model class that needs to be associated.
- `pivotTable`  The name of the pivot table.
- `foreignKey1` A foreign key in the pivot table that points to the current 
    model.
- `foreignKey2` A foreign key in the pivot table that points to the associated
    model.
- `[typeKey]` A field name in the pivot table that stores the associated model
    name when you are defining a polymorphic association.

**return:**

Returns the associated model instance so you can use its features to handle 
data.

Please check the example at section [model.hasVia()](#modelhasvia).
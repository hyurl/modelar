### model.belongsToThrough()

*Defines a belongs-to association through a middle model.*

**paraeters:**

- `Model` A model class that needs to be associated.
- `MiddleModel` The class of the middle model.
- `foreignKey1` A foreign key in the current model that points to the middle 
    model.
- `foreignKey2` A foreign key in the middle model that points to the 
    associated model.

**return:**

Returns the associated model instance so you can use its features to handle 
data.

Please check the example at section [model.hasThrough()](#modelhasthrough).
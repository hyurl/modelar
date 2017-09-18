### model.belongsTo()

*Defines a belongs-to association.*

**parameters:**

- `Model` A model class that needs to be associated.
- `foreignKey` A foreign key in the current model.
- `typeKey` A field name in the current model that stores the current model 
    name when you are defining a polymorphic association.

**return:**

Returns the associated model instance so you can use its features to handle 
data.

Please check the example at section [model.has()](#modelhas).
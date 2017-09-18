### model.detach()

*Deletes associations in a pivot table.*

**parameters:**

- `[models]` An array carries all models or numbers which represents the 
    values of models' primary keys that needs to be associated. If this 
    parameter is not provided, all associations of the caller model in the 
    pivot table will be deleted.

**return:**

Returns a Promise, and the the only argument passed to the callback of 
`then()` is the caller instance.

This method can only be called after calling `model.hasVia()` or 
`model.belongsToVia()`.

This method is similar to [model.attach()](#modelattach), please check the 
documentation above.
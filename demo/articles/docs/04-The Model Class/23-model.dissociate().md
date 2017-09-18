### model.dissociate()

*Removes the association bound by `model.associate()`.*

**return:**

Returns a Promise, and the the only argument passed to the callback of 
`then()` is the caller instance.

This method can only be called after calling `model.belongsTo()`.

This method is similar to [model.associate()](#modelassociate), please check 
the documentation above.
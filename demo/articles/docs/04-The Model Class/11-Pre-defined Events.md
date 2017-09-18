### Pre-defined Events

At Model level, there are some events you can set handlers to:

- `query` This event will be fired when the SQL statement is about to be 
    executed.
- `insert` This event will be fired when a new model is about to be inserted 
    into the database.
- `inserted` This event will be fired when a new model is successfully 
    inserted into the database.
- `update` This event will be fired when a model is about to be updated.
- `updated` This event will be fired when a model is successfully updated.
- `save` This event will be fired when a model is about to be saved.
- `saved` This event will be fired when a model is successfully saved.
- `delete` This event will be fired when a model is about to be deleted.
- `deleted` This event will be fired when a model is successfully deleted.
- `get` This event will be fired when a model is successfully fetched from 
    the database.
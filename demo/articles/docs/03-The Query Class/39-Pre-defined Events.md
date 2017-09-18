### Pre-defined Events

At Query level, there are some events you can set handlers to:

- `query` This event will be fired when the SQL statement is about to be 
    executed.
- `insert` This event will be fired when a new record is about to be inserted 
    into the database.
- `inserted` This event will be fired when a new record is successfully 
    inserted into the database.
- `update` This event will be fired when a record is about to be updated.
- `updated` This event will be fired when a record is successfully updated.
- `delete` This event will be fired when a record is about to be deleted.
- `deleted` This event will be fired when a record is successfully deleted.
- `get` This event will be fired when a record is successfully fetched from 
    the database.
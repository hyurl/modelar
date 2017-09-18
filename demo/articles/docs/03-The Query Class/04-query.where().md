### query.where()

*Set a where... clause for the SQL statement.*

**parameters:**

- `field` This could be a field name, or an object that sets multiple `=` 
    (equal) conditions for the clause. Or pass a callback function to generate
    nested conditions, the only argument passed to the callback is a new Query 
    nstance with its features.
- `[operator]` Condition operator, if the `value` isn't passed, then this 
    argument will replace it, and the operator will become an `=`. It is also 
    possible to pass this argument a callback function to generate a child-SQL 
    statement, the only argument passed to the callback is a new Query 
    instance, so that you can use its features to generate a SQL statement.
- `[value]` A value that needs to be compared with `field`. If this argument 
    is missing, then `operator` will replace it, and the operator will become 
    an `=`.

**return:**

Returns the current instance for function chaining.

```javascript
var query = new Query("users");

query.where("id", "=", 1);
//Equals to
query.where("id", 1);
//Or use other operators.
query.where("name", "<>", "ayon");
//Even like
query.where("name", "like", "%hyurl%");
//Or pass a callback for nested clause.
query.where("id", 1).where(_query=>{
    //_query is a new query instance.
    _query.where("name", "hyurl").orWhere("name", "test");
});
//Will generate like this: 
//where `id` = ? and (`name` = ? or `name` = ?);
//with bindings [1, 'hyurl', 'test'].

//Or pass the second argument a callback function.
query.where("id", _query=>{
    _query.select("user_id").from("articles").where("id", 1);
});
//Will generate like this: 
//where `id` = (select `user_id` from `articles` where `id` = ?);
//with bindings [1].
```
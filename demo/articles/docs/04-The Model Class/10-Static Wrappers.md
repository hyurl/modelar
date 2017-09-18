## Static Wrappers

Now we go through most of the Model's features, but every time we use them, 
we have to create a new instance, which is very inconvenient for many 
situations. For such a reason, Modelar provides static wrappers for almost all
its methods, they all automatically create instances, you can just call them 
without create one manually.

**These methods are exactly the same as their instantiated versions:**

- `Model.use()`
- `Model.transaction()`
- `Model.select()`
- `Model.join()`
- `Model.leftJoin()`
- `Model.rightJoin()`
- `Model.fullJoin()`
- `Model.crossJoin()`
- `Model.where()`
- `Model.whereBetween()`
- `Model.whereNotBetween()`
- `Model.whereIn()`
- `Model.whereNotIn()`
- `Model.whereNotIn()`
- `Model.whereNull()`
- `Model.whereNotNull()`
- `Model.orderBy()`
- `Model.random()`
- `Model.groupBy()`
- `Model.having()`
- `Model.limit()`
- `Model.all()`
- `Model.count()`
- `Model.max()`
- `Model.min()`
- `Model.svg()`
- `Model.sum()`
- `Model.chunk()`
- `Model.paginate()`
- `Model.insert()`
- `Model.delete()`
- `Model.get()`
- `Model.getMany()`

```javascript
//Now you can use static methods to handle data.
const User = require("modelar/User");

User.select("name", "email").get().then(user=>{
    //...
});

User.where("name", "<>", "admin").all().then(users=>{
    //...
});

User.chunk(15, users=>{
    //...
});

User.insert({
    name: "test",
    email: "test@localhost",
    password: "12345",
}).then(user=>{
    //...
});

User.get(1).then(user=>{
    //...
});

User.getMany({
    page: 2,
    sequence: "rand"
}).then(users=>{
    //...
});
```
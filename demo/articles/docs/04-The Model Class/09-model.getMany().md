### model.getMany()

*Gets multiple models that suit the given condition. Unlike `model.all()`,* 
*this method accepts other arguments in a simpler way to generate* 
*sophisticated SQL statement and fetch models with paginated information.*

**parameters:**

- `[args]` An object carries key-value pairs information for fields, and it 
    also accepts these properties:
    * `page` The current page, default is `1`.
    * `limit` The top limit of per page, default is `10`.
    * `orderBy` Ordered by a particular field, default is the primary key.
    * `sequence` The sequence of how the data are ordered, it could be `asc`, 
        `desc` or `rand`, default is `asc`.
    * `keywords` Keywords for vague searching, it could be a string or an 
        array.

**return:**

Returns a Promise, and the only argument passes to the callback of `then()` is
an Object that carries some information of these:

- `page` The current page.
- `limit` The top limit of per page.
- `orderBy` Ordered by a particular field.
- `sequence` The sequence of how the data are ordered.
- `keywords` Keywords for vague searching.
- `pages` A number of all model pages.
- `total` A number of all model counts.
- `data` An array that carries all fetched models.

```javascript
const User = require("modelar/User");

var user = new User();
user.getMany({
    limit: 15, //Set a top limit to 15.
    sequence: "rand", //Set sequence to be random.
    name: "hyurl", //Pass a particular field and value.
    id: "<100", //Pass a value with an operator.
}).then(info=>{
    console.log(info); //Print out all the information.
}).catch(err=>{
    console.log(err);
});
```

From the example given above, you can see with the `id`, I set ite value with 
an operator `>`, these is a very useful trick when you're searching some data 
that have a field with numbers, all supported operators are:

- `<`
- `>`
- `<=`
- `>=`
- `!=`
- `<>`
- `=`

But remember, when you pass an argument in this way, there is no space between
the operator and the value.
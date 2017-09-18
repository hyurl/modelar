### query.paginate()

*Gets paginated information of all records that suit given conditions.*

**parameters:**

- `[page]` The current page, default is `1`.
- `[length]` The top limit of per page, default is `10`. Also you can call 
    `query.limit()` to specify a length before calling this method.

**return:**

Returns a Promise, the only argument passes to the callback of `then()` is an 
object that carries the information, it includes:

* `page` The current page.
* `limit` The top limit of per page.
* `pages` A number of all record pages.
* `total` A number of all record counts.
* `data` An array that carries all fetched data.

```javascript
var query = Query("users");

query.where("id", ">", 0).paginate(1, 15).then(info=>{
    console.log(info);
    //It will be like this:
    //{
    //    page: 1,
    //    limit: 15,
    //    pages: 2,
    //    total: 24,
    //    data: [...]
    //}
}).catch(err=>{
    console.log(err);
});

//Also, you can do:
query.limit(15).paginate(1).then(info=>{
    //...
});
```
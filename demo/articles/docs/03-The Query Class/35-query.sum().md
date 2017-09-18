### query.sum()

*Gets the summarized value of a specified field in the table.*

**parameter:**

- `field` The specified field.

**return:**

Returns a Promise, and the the only argument passed to the callback of 
`then()` is a Number that counts records.

```javascript
var query = new Query("users");

//Count all names.
query.sum("id").then(num=>{
    console.log("The summary of IDs is "+num+".");
}).catch(err=>{
    console.log(err);
});
```
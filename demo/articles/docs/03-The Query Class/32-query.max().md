### query.max()

*Gets the maximum value of a specified field in the table.*

**parameter:**

- `field` The specified field.

**return:**

Returns a Promise, and the the only argument passed to the callback of 
`then()` is a Number that counts records.

```javascript
var query = new Query("users");

//Count all names.
query.max("id").then(max=>{
    console.log("The maximum ID in the table is "+max+".");
}).catch(err=>{
    console.log(err);
});
```
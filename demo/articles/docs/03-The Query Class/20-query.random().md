### query.random()

*Sets that the records will be ordered in random sequence.*

**return:**

Returns the current instance for function chaining.

```javascript
var query = new Query("users");

query.random();
//In MySQL: order by rand();
//In SQLite: order by random();
```
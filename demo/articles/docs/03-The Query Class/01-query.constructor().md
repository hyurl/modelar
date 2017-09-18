### query.constructor()

*Creates a new instance with a specified table name binding to it.*

**parameters:**

- `[table]` The table name binds to the instance.

```javascript
const Query = require("modelar/Query"); //import Query

//Instanciate a new query with the given table.
var query = new Query("users");
```
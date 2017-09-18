### model.withPivot()

*Gets extra data from the pivot table.*

**parameters:**

- `fields` A list of all target fields, each one passed as an argument, or 
    just pass the first argument as an array that carries all the field names.

**return:**

Returns the current instance for function chaining.

This method can only be called after calling `model.hasVia()` or 
`model.belongsToVia()`.

```javascript
const DB = require("modelar/DB");
const Model = require("modelar/Model");

var db = new DB("./modelar.db");

class User extends Model {
    constructor(data = {}) {
        super(data, {
            table: "users",
            primary: "id",
            fields: ["id", "name", "email", "password"],
            searchable: ["name", "email"]
        });
    }
}

class Role extends Model {
    constructor(data = {}) {
        super(data, {
            table: "roles",
            primary: "id",
            fields: ["id", "name"]
        });
    }

    get users() {
        return this.hasVia(User, "user_role", "user_id", "role_id")
            .withPivot("activated");
    }
}

//Get the role of which ID is 1.
Role.use(db).get(1).then(role => {
    //Get all users of the role.
    return role.users.all();
}).then(users => {
    for (let user of users) {
        //When getting data from the pivot table, those data will be stored in
        //the property model.__extra.
        console.log(user.valueOf(), user.__extra);
    }
}).catch(err => {
    console.log(err);
});
```
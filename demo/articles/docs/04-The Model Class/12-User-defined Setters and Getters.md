### User-defined Setters and Getters

Normally, the model will automatically define setters and getters for all 
fields of the model, but only if they are not defined. So for particular 
reasons, you can define you own setters and getters for some fields so that 
they can be more convenient for your needs.

```javascript
const DB = require("modelar/DB");
const Model = require("modelar");
const bcrypt = require('bcrypt-nodejs');

class User extends Model {
    constructor(data = {}) {
        super(data, {
            table: "users",
            primary: "id",
            fields: ["id", "name", "email", "password"],
            searchable: ["name", "email"]
        });
    }

    //The setter of password, use BCrypt to encrypt data.
    set password(v) {
        //Model's data are stored in the __data property.
        this.__data.password = bcrypt.hashSync(v);
    }

    //The getter of password, always return undefined.
    //When a getter returns undefined, that means when you call toString() or
    //valueOf(), or in a for...of... loop, this property will be absent.
    get password() {
        return undefined;
    }
}

var user = new User;
user.name = "test";
user.email = "test@localhost";
user.password = "12345";

console.log(user.password); //undefined
console.log(user.__data);
//Will be like:
//{ name: 'test',
//  email: 'test@localhost',
//  password: '$2a$10$TNnqjq/ooTsCxPRgDKcbL.r0pW7vLQLs8/4BMOqafSLnqwAzm3MJa' }

console.log(user.valueOf());
//Will be:
//{ name: 'test',
//  email: 'test@localhost' }

console.log(user.toString());
//Will be:
//{"name":"test","email":"test@localhost"}

for(let [field, value] of user){
    console.log(field, value);
}
//Will be:
//name test
//email test@localhost
```

#### Table of Contents

* [The Model Class](#The-Model-Class)
    * [model.constructor()](#model_constructor)
    * [model.assign()](#model_assign)
    * [model.save()](#model_save)
    * [model.insert()](#model_insert)
    * [model.update()](#model_update)
    * [model.delete()](#model_delete)
    * [model.get()](#model_get)
    * [model.all()](#model_all)
    * [model.getMany()](#model_getMany)
    * [Static Wrappers](#Static-Wrappers)
    * [Pre-defined Events](#Pre-defined-Events)
    * [User-defined Setters and Getters](#User-defined-Setters-and-Getters)
    * [Model Associations](#Model-Associations)
    * [model.has()](#model_has)
    * [model.belongsTo()](#model_belongsTo)
    * [model.hasThrough()](#model_hasThrough)
    * [model.belongsToThrough()](#model_belongsToThrough)
    * [model.hasVia()](#model_hasVia)
    * [model.belongsToVia()](#model_belongsToVia)
    * [model.associate()](#model_associate)
    * [model.dissociate()](#model_dissociate)
    * [model.attach()](#model_attach)
    * [model.detach()](#model_detach)
    * [model.withPivot()](#model_withPivot)
    * [model.whereState()](#model_whereState)

## The Model Class

*Model Wrapper.*

This class extends from Query class, there for has all the features that Query
has, and features that Query doesn't have, which makes data operation more 
easier and efficient.

Also, this class implements some useful API of ES2015, like `toString()`, 
`valueOf()`, `toJSON()`, and `Symbol.iterator`. You can call 
`model.toString()` or `JSON.stringify(model)` to generate a JSON string of 
the model, and call `model.valueOf()` to get the data of the model. If you
want to list out all properties of the model data, put the model in a 
for...of... loop, like `for(let [field, value] of model)`.

### model.constructor()

*Creates a new instance.*

**parameters:**

- `[data]` Initial data of the model.
- `[config]` Initial configuration of the model, they could be:
    * `table` The table name that the instance binds to.
    * `fields` Fields of the table in an array.
    * `primary` The primary key of the table.
    * `searchable` An array that carries all searchable fields, they could be 
        used when calling `model.getMany()`.

```javascript
const { Model } = require("modelar");

var article = new Model({
    title: "A new article in Modelar circumstance.",
    content: "This is the content of the article.",
}, {
    table: "articles",
    fields: [ "id", "title", "content" ],
    primary: "id",
    serachable: [ "title", "content" ]
});

// Alternatively, you can define a new class extends the Model, it would be 
// more convenient and is recommended. You can define methods and properties
// of its own.
class Article extends Model {
    constructor(data = {}) {
        super(data, {
            table: "articles",
            primary: "id",
            fields: [ "id", "title", "content" ],
            searchable: [ "title", "content" ]
        });
    }
}

// Now you can do:
var article = new Article({
    title: "A new article in Modelar circumstance.",
    content: "This is the content of the article.",
});

// Or:
var article = new Article;
article.title = "A new article in Modelar circumstance.";
article.content = "This is the content of the article.";

// When getting data, you can do:
console.log(article.title);
console.log(article.content);
```

### model.assign()

*Assigns data to the model instance.*

**parameters:**

- `data` The data in an object to be assigned.
- `[useSetter]` Use setters (if any) to process the data, default is `false`.

**return:**

Returns the current instance for function chaining.

```javascript
const { User } = require("modelar");

// Generally, there are there ways to put data in a model.
// Since User extends the Model, I will use it as an example.
// First, pass the data when instantiate:
var user = new User({
    name: "hyurl",
    email: "i@hyurl.com",
    password: "12345",
});

// Second, through pseudo-properties:
user.name = "hyurl";
user.email = "i@hyurl.com";
user.password = "12345";

// Third, call assign():
user.assign({
    name: "hyurl",
    email: "i@hyurl.com",
    password: "12345",
});

// The former two will automatically trigger user-defined setters, while the 
// third one will not, if you want it to, you must pass the second argument a 
// `true` to assign(), like this:
user.assign({
    name: "hyurl",
    email: "i@hyurl.com",
    password: "12345",
}, true);

// Another difference is that the former two cannot set data of the primary 
// key, while assign() can. But this is only helpful when you get those data 
// from the database and want to put them in the model, which is the Model 
// internally does, otherwise it just make problems.
user.assign({
    id: 1,
    name: "hyurl",
    email: "i@hyurl.com",
    password: "$2a$10$6Q4eEig4vJsEtCrmDb0CX.GAh/ZMWqd6St6jMYwKVD/bEzR2kfJqi",
});
```

### model.save()

*Saves the current model, if there is no record in the database, it will be*
*automatically inserted.*

**return:**

Returns a Promise, and the the only argument passed to the callback of 
`then()` is the current instance.

```javascript
const { User } = require("modelar");

var user = new User;
user.name = "hyurl";
user.email = "i@hyurl.com";
user.password = "12345";
user.save().then(user=>{
    console.log("The user (UID: "+user.id+") is saved.");
}).catch(err=>{
    console.log(err);
});
```

### model.insert()

*Inserts the current model as a new record into the database.*

*parameters:*

- `[data]` An object that carries fields and their values.

**return:**

Returns a Promise, and the the only argument passed to the callback of 
`then()` is the current instance.

```javascript
const { User } = require("modelar");

var user = new User;
user.insert({
    name: "testor",
    email: "testor@localhost",
    password: "12345",
}).then(user=>{
    console.log("User created with UID: "+user.id);
}).catch(err=>{
    console.log(err);
});
```

### model.update()

*Updates the current model.*

**parameters:**

- `[data]` An object that carries fields and their values.

**return:**

Returns a Promise, and the the only argument passed to the callback of 
`then()` is the current instance.

```javascript
const { User } = require("modelar");

var user = new User;
user.get(1).then(user=>{
    return user.update({
        name: "hyurl",
        email: "i@hyurl.com",
    });
}).then(user=>{
    console.log("User has been updated.");
}).catch(err=>{
    console.log(err);
});
```

### model.delete()

*Deletes the current model.*

**parameters:**

- `[id]` The value of the model's primary key.

**return:**

Returns a Promise, and the the only argument passed to the callback of 
`then()` is the current instance.

```javascript
const { User } = require("modelar");

var user = new User;
user.get(1).then(user=>{
    return user.delete();
}).then(user=>{
    console.log("User has been deleted.");
}).catch(err=>{
    console.log(err);
});

// Alternatively, you can just do:
user.delete(1).then(user=>{
    console.log("User has been deleted.");
}).catch(err=>{
    console.log(err);
});
```

### model.get()

*Gets a model from the database.*

**parameters:**

- `[id]` The value of the model's primary key.

**return:**

Returns a Promise, and the the only argument passed to the callback of 
`then()` is the fetched model.

This method will throw an error if no model was found.

```javascript
const { User } = require("modelar");

var user = new User;
user.where("id", 1).get().then(user=>{
    console.log(user);
}).catch(err=>{
    console.log(err);
})

// Alternatively, you can just do:
user.get(1).then(user=>{
    console.log(user);
});
```

### model.all()

*Gets all matched models from the database.*

**return:**

Returns a Promise, and the the only argument passed to the callback of 
`then()` is all the fetched models carried in an array.

This method will throw an error if no model was found.

```javascript
const { User } = require("modelar");

var user = new User;
user.all().then(users=>{
    // The users is an array that carries all user models.
    for(let _user of users){
        console.log(_user);
    }
}).catch(err=>{
    console.log(err);
})
```

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
an object that carries some information of these:

- `page` The current page.
- `limit` The top limit of per page.
- `orderBy` Ordered by a particular field.
- `sequence` The sequence of how the data are ordered.
- `keywords` Keywords for vague searching.
- `pages` A number of all model pages.
- `total` A number of all model counts.
- `data` An array that carries all fetched models.

```javascript
const { User } = require("modelar");

var user = new User();
user.getMany({
    limit: 15, // Set a top limit to 15.
    sequence: "rand", // Set sequence to be random.
    name: "hyurl", // Pass a particular field and value.
    id: "<100", // Pass a value with an operator.
}).then(info=>{
    console.log(info);
}).catch(err=>{
    console.log(err);
});
```

From the example given above, you can see with the `id`, I set its value with 
an operator `>`, this is a very useful trick when you're searching some data 
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
const { User } = require("modelar");

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

### Pre-defined Events

At Model level, there are some events you can set handlers to:

- `query` This event will be fired when the SQL statement is about to be 
    executed.
- `insert` This event will be fired when a new model is about to be inserted 
    into the database.
- `inserted` This event will be fired when a new model is successfully 
    inserted into the database.
- `update` This event will be fired when a model is about to be updated.
- `updated` This event will be fired when a model is successfully updated.
- `save` This event will be fired when a model is about to be saved.
- `saved` This event will be fired when a model is successfully saved.
- `delete` This event will be fired when a model is about to be deleted.
- `deleted` This event will be fired when a model is successfully deleted.
- `get` This event will be fired when a model is successfully fetched from 
    the database.

### User-defined Setters and Getters

Normally, the model will automatically define setters and getters for all 
fields of the model, but only if they are not defined. So for particular 
reasons, you can define you own setters and getters for some fields so that 
they can be more convenient for your needs.

```javascript
const { Model } = require("modelar");
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

    // The setter of password, use BCrypt to encrypt data.
    set password(v) {
        // Model's data are stored in the _data property.
        this._data.password = bcrypt.hashSync(v);
    }

    // The getter of password, always return undefined.
    // When a getter returns undefined, that means when you call toString() or
    // valueOf(), or in a for...of... loop, this property will be absent.
    get password() {
        return undefined;
    }
}

var user = new User;
user.name = "test";
user.email = "test@localhost";
user.password = "12345";

console.log(user.password); // undefined
console.log(user._data);
// Will be like:
// {
//   name: 'test',
//   email: 'test@localhost',
//   password: '$2a$10$TNnqjq/ooTsCxPRgDKcbL.r0pW7vLQLs8/4BMOqafSLnqwAzm3MJa' 
// }

console.log(user.valueOf());
// Will be:
// { name: 'test', email: 'test@localhost' }

console.log(user.toString());
// Will be:
// {"name":"test", "email":"test@localhost"}

for(let [field, value] of user){
    console.log(field, value);
}
// Will be:
// name test
// email test@localhost
```

## Model Associations

Modelar provides some methods for you to associate one model to others, in 
general, you can define a property with a setter, such a property can use 
these methods to concatenate models. These methods will generate a `caller` to
those models when being associated, so that you can access them with the 
current model.

### model.has()

*Defines a has (many) association.*

**parameters:**

- `Model` A model class that needs to be associated.
- `foreignKey` A foreign key in the associated model.
- `[typeKey]` A field name in the associated model that stores the current 
    model name when you are defining a polymorphic association.

**return:**

Returns the associated model instance so you can use its features to handle 
data.

```javascript
const { DB, Model } = require("modelar");

var db = new DB();

class User extends Model {
    constructor(data = {}) {
        super(data, {
            table: "users",
            primary: "id",
            fields: ["id", "name", "email", "password"],
            searchable: ["name", "email"]
        });
    }

    get articles() {
        return this.has(Article, "user_id");
    }

    get comments() {
        // Pass the argument `typeKey` to define a polymorphic association.
        return this.has(Comment, "commentable_id", "commentable_type");
    }
}

class Article extends Model {
    constructor(data = {}) {
        super(data, {
            table: "articles",
            primary: "id",
            fields: ["id", "title", "content", "user_id"],
            searchable: ["title", "content"]
        });
    }

    get user() {
        return this.belongsTo(User, "user_id");
    }

    get comments() {
        // Pass the argument `typeKey` to define a polymorphic association.
        return this.has(Comment, "commentable_id", "commentable_type");
    }
}

class Comment extends Model {
    constructor(data = {}) {
        super(data, {
            table: "comments",
            primary: "id",
            fields: ["id", "content", "commentable_id", "commentable_type"],
            searchable: ["name"]
        });
    }

    get user() {
        return this.belongsTo(User, "commentable_id", "commentable_type");
    }

    get article() {
        return this.belongsTo(Article, "commentable_id", "commentable_type");
    }
}

// Get the user whose ID is 1.
User.use(db).get(1).then(user => {
    // Print out the user's data.
    console.log(user.valueOf());
    return user;
}).then(user => {
    // Get all articles of the user.
    return user.articles.all().then(articles => {
        // Print out all articles' data.
        for (let article of articles) {
            console.log(article.valueOf());
        }

        return user;
    });
}).then(user => {
    // Get all comments of the user.
    return user.comments.all().then(comments => {
        // Print out all comments' data.
        for (let comment of comments) {
            console.log(comment.valueOf());
        }

        return user;
    });
}).catch(err => {
    console.log(err);
});

// Get the article of which ID is 1.
Article.use(db).get(1).then(article => {
    // Print out the article's data.
    console.log(article.valueOf());
    return article;
}).then(article => {
    // Get the user the of the article.
    return article.user.get().then(user => {
        // Print out the user's data.
        console.log(user.valueOf());
        return article;
    });
}).then(article => {
    // Get all comments of the article.
    return article.comments.all().then(comments => {
        // Print out all comments' data.
        for (let comment of comments) {
            console.log(comment.valueOf());
        }

        return article;
    });
}).catch(err => {
    console.log(err);
});

// Get the comment of which ID is 1.
Comment.use(db).get(1).then(comment => {
    // Print out the comment.
    console.log(comment.valueOf());
    return comment;
}).then(comment => {
    if (comment.commentable_type == "User") {
        // Get the user of the comment.
        return comment.user.get().then(user => {
            // Print out the user.
            console.log(user.valueOf());
            return comment;
        });
    } else if (comment.commentable_type == "Article") {
        // Get the article of the comment.
        return comment.article.get().then(article => {
            // Print out the article.
            console.log(article.valueOf());
            return comment;
        });
    } else {
        return comment;
    }
}).catch(err => {
    console.log(err);
});
```

### model.belongsTo()

*Defines a belongs-to association.*

**parameters:**

- `Model` A model class that needs to be associated.
- `foreignKey` A foreign key in the current model.
- `typeKey` A field name in the current model that stores the associated model
    name when you are defining a polymorphic association.

**return:**

Returns the associated model instance so you can use its features to handle 
data.

Please check the example at section [model.has()](#model_has).

### model.hasThrough()

*Defines a has (many) association through a middle model.*

**parameters:**

- `Model` A model class that needs to be associated.
- `MiddleModel` The class of the middle model. 
- `foreignKey1` A foreign key in the associated model that points to the 
    middle model.
- `foreignKey2` A foreign key in the middle model that points to the current 
    model.

**return:**

Returns the associated model instance so you can use its features to handle 
data.

```javascript
const { DB, Model } = require("modelar");

var db = new DB();

class Country extends Model {
    constructor(data = {}) {
        super(data, {
            table: "countries",
            primary: "id",
            fields: ["id", "name"],
            searchable: ["name"]
        });
    }

    get articles() {
        return this.hasThrough(Article, User, "user_id", "country_id");
    }
}

class User extends Model {
    constructor(data = {}) {
        super(data, {
            table: "users",
            primary: "id",
            fields: ["id", "name", "email", "password", "country_id"],
            searchable: ["name", "email"]
        });
    }
}

class Article extends Model {
    constructor(data = {}) {
        super(data, {
            table: "articles",
            primary: "id",
            fields: ["id", "title", "content", "user_id"],
            searchable: ["title", "content"]
        });
    }

    get country() {
        return this.belongsToThrough(Country, User, "user_id", "country_id");
    }
}

//Get the country of which ID is 1.
Country.use(db).get(1).then(country => {
    //Print out the country.
    console.log(country.valueOf());

    return country.articles.all().then(articles => {
        //Print out all articles.
        for (let article of articles) {
            console.log(article.valueOf());
        }
    });
}).catch(err => {
    console.log(err);
});

//Get the article of which ID is 1.
Article.use(db).get(1).then(article => {
    //Print out the article.
    console.log(article.valueOf());

    //Get the country of the article.
    return article.country.get().then(country => {
        //Print out the country.
        console.log(country.valueOf());
    });
}).catch(err => {
    console.log(err);
});
```

### model.belongsToThrough()

*Defines a belongs-to association through a middle model.*

**parameters:**

- `Model` A model class that needs to be associated.
- `MiddleModel` The class of the middle model.
- `foreignKey1` A foreign key in the current model that points to the middle 
    model.
- `foreignKey2` A foreign key in the middle model that points to the 
    associated model.

**return:**

Returns the associated model instance so you can use its features to handle 
data.

Please check the example at section [model.hasThrough()](#model_hasThrough).

### model.hasVia()

*Defines a has (many) association via a pivot table.*

**parameters:**

- `Model` A model class that needs to be associated.
- `pivotTable` The name of the pivot table.
- `foreignKey1` A foreign key in the pivot table that points to the associated
    model.
- `foreignKey2` A foreign key in the pivot table that points to the current 
    model.
- `[typeKey]` A field name in the pivot table that stores the current model 
    name when you are defining a polymorphic association.

**return:**

Returns the associated model instance so you can use its features to handle 
data.

```javascript
const { DB, Model } = require("modelar");

var db = new DB();

class User extends Model {
    constructor(data = {}) {
        super(data, {
            table: "users",
            primary: "id",
            fields: ["id", "name", "email", "password"],
            searchable: ["name", "email"]
        });
    }

    get roles() {
        return this.hasVia(Role, "user_role", "role_id", "user_id");
    }

    get tags() {
        return this.hasVia(
            Tag, "taggables", "tag_id", "taggable_id", "taggable_type");
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
        return this.belongsToVia(User, "user_role", "role_id", "user_id");
        // Alternatively, you can call:
        // return this.hasVia(User, "user_role", "user_id", "role_id");
        // But be aware of the different sequence of arguments.
        // And this is only for the situation that the argument `typeKey` is 
        // not passed.
    }
}

class Article extends Model {
    constructor(data = {}) {
        super(data, {
            table: "articles",
            primary: "id",
            fields: ["id", "title", "content", "user_id"],
            searchable: ["title", "content"]
        });
    }

    get tags() {
        return this.hasVia(Tag, "taggables", "tag_id", "taggable_id", "taggable_type");
    }
}

class Tag extends Model {
    constructor(data = {}) {
        super(data, {
            table: "tags",
            primary: "id",
            fields: ["id", "name"]
        });
    }

    get users() {
        // Must use model.belongsToVia() when passing the argument `typeKey`.
        return this.belongsToVia(User, "taggables", "tag_id", "taggable_id", "taggable_type");
    }

    get articles() {
        return this.belongsToVia(Article, "taggables", "tag_id", "taggable_id", "taggable_type");
    }
}

// Get the user of whose ID is 1.
User.use(db).get(1).then(user => {
    // Print out the user's data.
    console.log(user.valueOf());

    // Get all roles of the user.
    return user.roles.all().then(roles => {
        // Print out all roles.
        for (let role of roles) {
            console.log(role.valueOf());
        }

        return user;
    });
}).then(user => {
    // Get all tags of the user.
    return user.tags.all().then(tags => {
        // Print out all tags.
        for (let tag of tags) {
            console.log(tag.valueOf());
        }
    });
}).catch(err => {
    console.log(err);
});

// Get the article of which ID is 1.
Article.use(db).get(1).then(article => {
    // Print out the article.
    console.log(article.valueOf());

    // Get all tags of the article.
    return article.tags.all().then(tags => {
        // Print out all tags.
        for (let tag of tags) {
            console.log(tag.valueOf());
        }

        return article;
    });
}).catch(err => {
    console.log(err);
});

// Get the role of which ID is 1.
Role.use(db).get(1).then(role => {
    // Print out the role.
    console.log(role.valueOf());

    // Get all users of the role.
    return role.users.all().then(users => {
        // Print out all users.
        for (let user of users) {
            console.log(user.valueOf());
        }

        return role;
    });
}).catch(err => {
    console.log(err);
});

// Get the tag of which ID is 1.
Tag.use(db).get(1).then(tag => {
    //print out the tag.
    console.log(tag.valueOf());

    // Get all users of the tag.
    return tag.users.all().then(users => {
        // Print out all users.
        for (let user of users) {
            console.log(user.valueOf());
        }

        return tag;
    })
}).then(tag => {
    // Get all articles of the tag.
    return tag.articles.all().then(articles => {
        // Print out all articles.
        for (let article of articles) {
            console.log(article.valueOf());
        }
    })
}).catch(err => {
    console.log(err);
});
```

### model.belongsToVia()

*Defines a belongs-to (many) association via a pivot table.*

**parameters:**

- `Model` A model class that needs to be associated.
- `pivotTable`  The name of the pivot table.
- `foreignKey1` A foreign key in the pivot table that points to the current 
    model.
- `foreignKey2` A foreign key in the pivot table that points to the associated
    model.
- `[typeKey]` A field name in the pivot table that stores the associated model
    name when you are defining a polymorphic association.

**return:**

Returns the associated model instance so you can use its features to handle 
data.

Please check the example at section [model.hasVia()](#model_hasVia).

### model.associate()

*Makes an association to a specified model.*

**parameters:**

- `model` A model that needs to be associated or a number that represents the 
    value of the model's primary key.

**return:**

Returns a Promise, and the the only argument passed to the callback of 
`then()` is the caller instance.

This method can only be called after calling `model.belongsTo()`.

```javascript
const { DB, Model } = require("modelar");

var db = new DB();

class User extends Model {
    constructor(data = {}) {
        super(data, {
            table: "users",
            primary: "id",
            fields: ["id", "name", "email", "password"],
            searchable: ["name", "email"]
        });
    }

    get articles() {
        return this.has(Article, "user_id");
    }

    get comments() {
        // Pass the argument `typeKey` to define a polymorphic association.
        return this.has(Comment, "commentable_id", "commentable_type");
    }
}

class Article extends Model {
    constructor(data = {}) {
        super(data, {
            table: "articles",
            primary: "id",
            fields: ["id", "title", "content", "user_id"],
            searchable: ["title", "content"]
        });
    }

    get user() {
        return this.belongsTo(User, "user_id");
    }

    get comments() {
        // Pass the argument `typeKey` to define a polymorphic association.
        return this.has(Comment, "commentable_id", "commentable_type");
    }
}

class Comment extends Model {
    constructor(data = {}) {
        super(data, {
            table: "comments",
            primary: "id",
            fields: ["id", "content", "commentable_id", "commentable_type"],
            searchable: ["name"]
        });
    }

    get user() {
        return this.belongsTo(User, "commentable_id", "commentable_type");
    }

    get article() {
        return this.belongsTo(Article, "commentable_id", "commentable_type");
    }
}

// Get the article of which ID is 1.
Article.use(db).get(1).then(article => {
    // Print out the article's data.
    console.log(article.valueOf());
    return article;
}).then(article => {
    // Associate the article's user to the user whose ID is 1.
    return User.use(db).get(1).then(user => {
        return article.user.associate(user);
        // model.associate() returns a Promise, and the only argument passed 
        // to that Promise.then() is the caller instance, which in this case, 
        // is the article.
    });
    // Alternatively you could just pass the ID to the method.
    // return article.user.associate(1);
}).then(article => {
    // Get the user of the article.
    return article.user.get().then(user => {
        // Print out user's data.
        console.log(user.valueOf());

        return article;
    });
}).catch(err => {
    console.log(err);
});

// Get the comment of which ID is 1.
Comment.use(db).get(1).then(comment => {
    // Print out the comment.
    console.log(comment.valueOf());
    return comment;
}).then(comment => {
    // Associate the comment's user to the user whose ID is 1.
    return User.use(db).get(1).then(user => {
        return comment.user.associate(user);
    });
    // Alternatively you could just pass the ID to the method.
    // return comment.user.associate(1);
}).then(comment => {
    // Get the user of the comment.
    return comment.user.get().then(user => {
        // Print out user's data.
        console.log(user.valueOf());

        return comment;
    });
}).catch(err => {
    console.log(err);
});
```

### model.dissociate()

*Removes the association bound by `model.associate()`.*

**return:**

Returns a Promise, and the the only argument passed to the callback of 
`then()` is the caller instance.

This method can only be called after calling `model.belongsTo()`.

This method is similar to [model.associate()](#model_associate), please check 
the documentation above.

### model.attach()

*Updates associations in a pivot table.*

- `models` An array carries all models or numbers which represents the values 
    of models' primary keys that needs to be associated. Also, it is possible 
    to pass this argument an object that its keys represent the values of 
    models' primary keys, and its values sets extra data in the pivot table.

**return:**

Returns a Promise, and the the only argument passed to the callback of 
`then()` is the caller instance.

This method can only be called after calling `model.hasVia()` or 
`model.belongsToVia()`.

One thing to remember, this method will also delete those associations which 
are not provided in the `models`, so you must provide all models or IDs to the
argument every time you call this method.

```javascript
const { DB, Model } = require("modelar");

var db = new DB();

class User extends Model {
    constructor(data = {}) {
        super(data, {
            table: "users",
            primary: "id",
            fields: ["id", "name", "email", "password"],
            searchable: ["name", "email"]
        });
    }

    get roles() {
        return this.hasVia(Role, "user_role", "role_id", "user_id");
    }

    get tags() {
        return this.hasVia(Tag, "taggables", "tag_id", "taggable_id", "taggable_type");
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
        return this.hasVia(User, "user_role", "user_id", "role_id");
        // Alternatively, you can call:
        // return this.belongsToVia(User, "user_role", "role_id", "user_id");
        // But be aware of the different sequence of arguments.
    }
}

class Tag extends Model {
    constructor(data = {}) {
        super(data, {
            table: "tags",
            primary: "id",
            fields: ["id", "name"]
        });
    }

    get users() {
        return this.belongsToVia(User, "taggables", "tag_id", "taggable_id", "taggable_type");
    }
}

// Get the user whose ID is 1.
User.use(db).get(1).then(user => {
    // Print out the user's data.
    console.log(user.valueOf());

    // Update associations of user's roles.
    return user.roles.attach([1, 2, 3]);
    // You may also want to try this out if you have a field `activated` in 
    // the pivot table `user_role`:
    //  return user.roles.attach({
    //      1: { activated: 1 },
    //      2: { activated: 1 },
    //      3: { activated: 0 }
    //  });
}).then(user => {
    // Get all roles of the user.
    return user.roles.all().then(roles => {
        // Print out all roles.
        for (let role of roles) {
            console.log(role.valueOf());
        }

        return user;
    });
}).then(user => {
    // Associate all tags to the user.
    return Tag.use(db).all().then(tags=>{
        return user.tags.attach(tags);
    });
}).then(user => {
    // Get all tags of the user.
    return user.tags.all().then(tags => {
        // Print out all tags.
        for (let tag of tags) {
            console.log(tag.valueOf());
        }
    });
}).catch(err => {
    console.log(err);
});

// Get the role of which ID is 1.
Role.use(db).get(1).then(role => {
    // Print out the role.
    console.log(role.valueOf());

    // Update associations of the role's users.
    return role.users.attach([1, 2, 3]);
}).then(role => {
    // Get all users of the role.
    return role.users.all().then(users => {
        // Print out all users.
        for (let user of users) {
            console.log(user.valueOf());
        }

        return role;
    });
}).catch(err => {
    console.log(err);
});

// Get the tag of which ID is 1.
Tag.use(db).get(1).then(tag => {
    // print out the tag.
    console.log(tag.valueOf());

    // Update associations of the tag's users.
    return tag.users.attach([1, 2, 3]);
}).then(tag => {
    // Get all users of the tag.
    return tag.users.all().then(users => {
        // Print out all users.
        for (let user of users) {
            console.log(user.valueOf());
        }

        return tag;
    })
}).catch(err => {
    console.log(err);
});
```

### model.detach()

*Deletes associations in a pivot table.*

**parameters:**

- `[models]` An array carries all models or numbers which represents the 
    values of models' primary keys that needs to be dissociated. If this 
    parameter is not provided, all associations of the caller model in the 
    pivot table will be deleted.

**return:**

Returns a Promise, and the the only argument passed to the callback of 
`then()` is the caller instance.

This method can only be called after calling `model.hasVia()` or 
`model.belongsToVia()`.

This method is similar to [model.attach()](#model_attach), please check the 
documentation above.

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
const { DB, Model } = require("modelar");

var db = new DB();

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
        //the property model._extra.
        console.log(user.valueOf(), user._extra);
    }
}).catch(err => {
    console.log(err);
});
```

### model.whereState()

<small>(Since 1.0.2)</small>
*Sets an extra where... clause for the SQL statement when updating or*
*deleting the model to mark the state.*

**parameters:**

- `field` This could be a field name, or an object that sets multiple `=` 
    (equal) conditions for the clause. Or pass a callback function to generate
    nested conditions, the only argument passed to the callback is a new Query
    instance with its features.

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

This method is meant to implement optimistic locking for the model, with 
transaction, we create a field in the table that stores the state of the 
model. When updating or deleting the model, we check this state, if it fulfils
the condition, that means the action is succeeded and the transaction is good 
to commit, otherwise, the transaction must be rolled back.

Unlike other methods inherited form Query, this method can be used only once,
if you call it multiple times, only the last state will be checked.

```javascript
const { Model } = require("modelar/Model");

class Product extends Model {
    constructor(data = {}) {
        super(data, {
            table: "products",
            primary: "id",
            //The `count` is a state field, indicates whether there still are 
            //products left for trading.
            fields: ["id", "name", "price", "count"],
            searchable: ["name"]
        });
    }
}

//Start the transaction.
Product.transaction(product => {
    //Get the product first.
    return product.get(1).then(product => {
        if (product.count < 1) {
            throw new Error("This product has been sold out.");
        } else {
            //Say we sale one product at one time, this count is the left.
            product.count -= 1;
            //Save the product with a state, in this case, the count, if the 
            //count has been changed to 0 by other process, this action will 
            //fail, and the transaction will be automatically rolled back.
            return product.whereState("count", ">", 0).save();
        }
    })
}).then(product => {
    console.log(`One product sold, ${product.count} left.`);
    //Be aware, after updating the record, the model will re-get the record 
    //from the databse, so this `product.count` may not be the one that 
    //previously manipulated, but actually the count in the database.
}).catch(err => {
    console.log(err);
});
```

#### Table of Contents

* [The Model Class](#The-Model-Class)
    * [Events](#Events)
    * [model.primary](#model_primary)
    * [model.fields](#model_fields)
    * [model.searchable](#model_searchable)
    * [model.data](#model_data)
    * [model.extra](#model_extra)
    * [model.isNew](#model_isNew)
    * [model.throwNotFoundError](model.throwNotFoundError)
    * [model.constructor()](#model_constructor)
    * [model.assign()](#model_assign)
    * [model.save()](#model_save)
    * [model.insert()](#model_insert)
    * [model.update()](#model_update)
    * [model.delete()](#model_delete)
    * [model.get()](#model_get)
    * [model.all()](#model_all)
    * [model.getMany()](#model_getMany)
    * [model.whereState()](#model_whereState)
    * [model.createTable()](#model_createTable)
    * [Static Wrappers](#Static-Wrappers)
    * [User-defined Setters and Getters](#User-defined-Setters-and-Getters)
    * [Model Associations](#Model-Associations)
    * [model.has()](#model_has)
    * [model.belongsTo()](#model_belongsTo)
    * [model.hasThrough()](#model_hasThrough)
    * [model.belongsToThrough()](#model_belongsToThrough)
    * [model.hasVia()](#model_hasVia)
    * [model.belongsToVia()](#model_belongsToVia)
    * [model.wherePivot()](#model_wherePivot)
    * [model.withPivot()](#model_withPivot)
    * [model.associate()](#model_associate)
    * [model.dissociate()](#model_dissociate)
    * [model.attach()](#model_attach)
    * [model.detach()](#model_detach)

## The Model Class

*Model Wrapper and beyond.*

This class extends from Query class, there for has all the features that Query
has, and features that Query doesn't have, which makes data operation more 
easier and efficient.

Also, this class implements some useful API of ES2015, like `toString()`, 
`valueOf()`, `toJSON()`, and `Symbol.iterator`. You can call 
`model.toString()` or `JSON.stringify(model)` to generate a JSON string of 
the model, and call `model.valueOf()` to get the data of the model. If you
want to list out all properties of the model data, put the model in a 
for...of... loop, like `for(let { key, value } of model)`.

### Events

- `save` Fired when a model is about to be saved.
- `saved` Fired when a model is successfully saved.

All the listeners bound to these events accept a parameter, which is the 
current Model instance.

### model.primary

`string` *Primary key of the table.*

### model.fields

`string[]` *Fields in the table.*

### model.searchable

`string[]` *Searchable fields in the table.* 

These fields are used when calling `model.getMany()` and set `keywords` for 
fuzzy query.

### model.data

`{ [field: string]: any }` *The real data of the model.*

### model.extra

`readonly` `{ [field: string]: any }` *Extra data of the model.*

When calling `model.assign()`, those data which are not defined in the `model.fields` will be stored in this property, and they won't be used when 
inserting or updating the model.

### model.isNew

`readonly` `boolean` *Whether the current model is new.*

### model.throwNotFoundError

`boolean` If `false`, then failed calling `model.get()` and `model.all()` will 
not throw a `NotFoundError`, just return `null` on `get()` and `[]` on  
`all()`. Default is `true`.

### model.constructor()

*Creates a new instance.*

**signatures:**

- `new Model`
- `new Model(data: { [field: string]: any })`
- `new Model(data: { [field: string]: any }, config: ModelConfig)`

Interface `ModelConfig` includes:

- `table: string` The table that the model binds to.
- `primary: string` Primary key of the model's table.
- `fields: string[]` Fields in the model's table.
- `searchable?: string[]` Searchable fields in the model's table, they will be
    used when calling `model.getMany()` for vague searching.

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

Since Modelar 3.1.0, there is a new way to set `ModelConfig`, rather than put 
them is the `super()` constructor, you can assign them as properties.

```javascript
class Article extends Model {
    constructor(data) {
        super(data);
        this.table = "users";
        this.primary = "id"; // must define 'primary' before 'fields'
        this.fields = ["id", "title", "content"];
        this.searchable = ["title", "content"];
    }
}
```

If you're using **TypeScript**, you can declare you model class with 
**decorators**.

```typescript
import { Model, field, primary, searchable, autoIncrement } from "modelar";

export class Article extends Model {
    table = "articles";

    @field
    @primary
    @autoIncrement
    id: number

    @field("varchar", 100)
    @searchable
    title: string

    @field("text")
    content: string
}
```

It's very recommended that you use TypeScript to program with Modelar, which 
will gives you more features of the language and the model.

### model.assign()

*Assigns data to the model instance.*

**signatures:**

- `assign(data: { [field: string]: any }, useSetter?: boolean): this`
    - `useSetter` Use setters (if any) to process the data, default: `false`.

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

**signatures:**

- `save(): Promise<this>`

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

**signatures:**

- `insert(data?: { [field: string]: any }): Promise<this>`

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

**signatures:** 

- `update(data?: { [field: string]: any }): Promise<this>`

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

**signatures:**

- `delete(id?: number): Promise<this>`

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

// Or just:
user.delete(1).then(user=>{
    // ...
})
```

### model.get()

*Gets a model from the database.*

**signatures:**

- `get(id?: number): Promise<this>`

This method will throw an error if no model was found, unless you set 
`model.throwNotFoundError` to `false`.

```javascript
const { User } = require("modelar");

var user = new User;
user.where("id", 1).get().then(user=>{
    console.log(user);
}).catch(err=>{
    console.log(err);
});

// Or just:
user.get(1).then(user=>{
    // ...
});
```

### model.all()

*Gets all matched models from the database.*

**signatures:**

- `all(): Promise<this[]>`

This method will throw an error if no model was found, unless you set 
`model.throwNotFoundError` to `false`.

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
});
```

### model.getMany()

*Gets multiple models that suit the given condition.*

Unlike `model.all()`, this method accepts other options in a simpler way to 
generate sophisticated SQL statement and fetch models with paginated 
information.

**signatures:**

- `getMany(options?: ModelGetManyOptions): Promise<PaginatedModels>`

Interface `ModelGetManyOptions` includes:

- `page?: number` Default is `1`.
- `limit?: number` Default is `10`.
- `orderBy?: string` Default is the primary key.
- `sequence?: "asc" | "desc" | "rand"` Default is `asc`.
- `keywords?: string | string[]` Keywords for vague searching.
- `[field: string]: any` Other conditions.

Interface `PaginatedModels` includes:

- `page: number` The current page.
- `pages: number` A number of all model pages.
- `limit: number` The top limit of per page.
- `total: number` A number of all model counts.
- `orderBy?: string` Ordered by a particular field.
- `sequence?: "asc" | "desc" | "rand"` The sequence of how the data are 
    ordered.
- `keywords?: string | string[]` Keywords for vague searching.
- `data: Model[]` An array that carries all fetched models.

**Notes:** After Modelar 3.2.0, this interface extends the `Array`, so you can 
use all supported method of Array to manipulate it, e.g. iterating inside 
`for...of...` loop, invoking `forEach()`, `map()`, etc. Before that, it's just 
an object, you can access its `data` property instead. For compatible reasons, 
you can still access `data` after 3.2.0.

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
an operator `<`, this is a very useful trick when you're searching some data 
that have a field with numbers, all supported operators are:

- `<`
- `>`
- `<=`
- `>=`
- `!=`
- `<>`
- `=`

But remember, when you pass a value in this way, there is no space between
the operator and the value.

### model.whereState()

*Sets an extra `where...` clause for the SQL statement when updating or*
*deleting the model to mark the state.*

**signatures:**

- `whereState(field: string, value: any): this`
- `whereState(field: string, operator: string, value: any): this`
- `whereState(fields: { [field: string]: any }): this`

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

### model.createTable()

*Create database table according to the class definition.*

**signatures:**

- `createTable(): Promise<this>`

This method only works when you're using TypeScript and the model class is 
defined with **decorators**.

## Static Wrappers

Now we go through most of the Model's features, but every time we use them, 
we create a new instance, which is very inconvenient for many situations. For 
such a reason, Modelar provides static wrappers for most of its methods, they 
all automatically create instances, you can just call them directly.

**These methods are exactly the same as their instantiated versions:**

- `Model.set()`
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
- `Model.createTable()`

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
        // Model's data are stored in the `data` property.
        this.data.password = bcrypt.hashSync(v);
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
console.log(user.data);
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
general, you can define a property with a getter, such a property can use 
these methods to concatenate models. These methods will generate a `caller` to
those models when being associated, so that you can access them with the 
current model.

### model.has()

**signatures:**

- `has(ModelClass: typeof Model, foreignKey: string): Model` 

    Defines a `has (many)` association.
    - `foreignKey` A foreign key in the associated model.

- `has(ModelClass: typeof Model, foreignKey: string, type: string): Model`
    
    Defines a polymorphic `has (many)` association.
    - `type` A field name in the associated model that stores the current 
        model name.

This method is `protected`, you must call it in the class when using 
TypeScript.

```typescript
import { User as _User, field, primary, seachable, autoIncrement } from "modelar";

export class User extends _User {
    // Using a plural noun just indicates that this user has many aricles,
    // not returning an array.
    get articles(): Article {
        return <Article>this.has(Article, "user_id");
    }

    get comments(): Comment {
        return <Comment>this.has(Comment, "commentable_id", "commentable_type");
    }
}

export class Article extends Model {
    table = "articles";

    @field
    @primary
    @autoIncrement
    id: number;

    @field("varchar", 255)
    @searchable
    title: string;

    @field("varchar", 1024)
    @defaultValue("")
    content: string;

    @field("int", 10)
    @defaultValue(0)
    user_id: number;

    get user(): User {
        return <User>this.belongsTo(User, "user_id");
    }

    get comments(): Comment {
        return <Comment>this.has(Comment, "commentable_id", "commentable_type");
    }
}

export class Comment extends Model {
    table = "comments";

    @field
    @primary
    @autoIncrement
    id: number;

    @field("varchar", 1024)
    @defaultValue("")
    content: string;

    @field("int", 10)
    commentable_id: number;

    @field("varchar", 32)
    commentable_type: string;

    get user(): User {
        return <User>this.belongsTo(User, "commentable_id", "commentable_type");
    }

    get article(): Article {
        return <Article>this.belongsTo(Article, "commentable_id", "commentable_type");
    }
}
```

### model.belongsTo()

**signatures:**

- `belongsTo(ModelClass: typeof Model, foreignKey: string): Model`

    *Defines a `belongs-to` association.*
    - `foreignKey` A foreign key in the current model.

- `belongsTo(ModelClass: typeof Model, foreignKey: string, type: string): Model`

    *Defines a polymorphic `belongs-to` association.*
    - `type` A field name in the current model that stores the associated 
        model name.

This method is `protected`, you must call it in the class when using 
TypeScript.

Please check the example at section [model.has()](#model_has).

### model.hasThrough()

*Defines a `has (many)` association through a middle model.*

**signatures:**

- `hasThrough(ModelClass: typeof Model, MiddleClass: typeof Model, foreignKey1: string, foreignKey2: string): Model`

    - `MiddleClass` The class of the middle model.
    - `foreignKey1` A foreign key in the associated model that points to the 
        middle model.
    - `foreignKey2` A foreign key in the middle model that points to the 
        current model.

This method is `protected`, you must call it in the class when using 
TypeScript.

```typescript
import { User as _User, field, primary, seachable, autoIncrement } from "modelar";

export class User extends _User {
    @field("int", 10)
    country_id: number;
}

export class Country extends Model {
    table = "countries";

    @field
    @primary
    @autoIncrement
    id: number;

    @field("varchar", 32)
    name: string;

    get articles() {
        return <Article>this.hasThrough(Article, User, "user_id", "country_id");
    }
}

export class Article extends Model {
    table = "articles";

    @field
    @primary
    @autoIncrement
    id: number;

    @field("varchar", 255)
    @searchable
    title: string;

    @field("varchar", 1024)
    @defaultValue("")
    content: string;

    @field("int", 10)
    @defaultValue(0)
    user_id: number;

    get country() {
        return <Country>this.belongsToThrough(Country, User, "user_id", "country_id");
    }
}
```

### model.belongsToThrough()

*Defines a `belongs-to` association through a middle model.*

**signatures:**

- `belongsToThrough(ModelClass: typeof Model, MiddleClass: typeof Model, foreignKey1: string, foreignKey2: string): Model`

    - `MiddleClass` The class of the middle model.
    - `foreignKey1` A foreign key in the current model that points to the 
        middle model.
    - `foreignKey2` A foreign key in the middle model that points to the 
        associated model.

This method is `protected`, you must call it in the class when using 
TypeScript.

Please check the example at section [model.hasThrough()](#model_hasThrough).

### model.hasVia()

**signatures:**

- `hasVia(ModelClass: typeof Model, pivotTable: string, foreignKey1: string, foreignKey2: string): Model`

    *Defines a `has many` association via a pivot table.*
    - `pivotTable` The name of the pivot table.
    - `foreignKey1` A foreign key in the pivot table that points to the 
        associated model.
    - `foreignKey2` A foreign key in the pivot table that points to the
        current model.

- `hasVia(ModelClass: typeof Model, pivotTable: string, foreignKey1: string, foreignKey2: string, type: string): Model`

    *Defines a polymorphic `has many` association via a pivot table.*
    - `type` A field name in the pivot table that stores the current model 
        name.

This method is `protected`, you must call it in the class when using 
TypeScript.

```typescript
import { User as _User, Table, field, primary, seachable, autoIncrement } from "modelar";

export class User extends _User {
    @field("int", 10)
    country_id: number;

    get roles() {
        return <Role>this.hasVia(Role, "userroles", "role_id", "user_id").withPivot("activated");
    }

    get activatedRoles() {
        return <Role>this.hasVia(Role, "userroles", "role_id", "user_id")
            .wherePivot("activated", 1).withPivot("activated");
    }

    get tags() {
        return <Tag>this.hasVia(Tag, "taggables", "tag_id", "taggable_id", "taggable_type");
    }
}

export class Role extends Model {
    table = "roles";

    @field
    @primary
    @autoIncrement
    id: number;

    @field("varchar", 32)
    name: string;

    get users() {
        return <User>this.belongsToVia(User, "userroles", "role_id", "user_id");
    }
}

export class Tag extends Model {
    table = "tags";

    @field
    @primary
    @autoIncrement
    id: number;

    @field("varchar", 32)
    name: string;

    get users() {
        return <User>this.belongsToVia(User, "taggables", "tag_id", "taggable_id", "taggable_type");
    }
}

// Must create tables `userroles` and `taggables`:
var table1 = new Table("userroles");
table.addColumn("user_id", "int", 10).notNull();
table.addColumn("role_id", "int", 10).notNull();
table.addColumn("activated", "int", 1).notNull().default(0);

var table2 = new Table("taggables");
table.addColumn("tag_id", "int", 10).notNull();
table.addColumn("taggable_id", "int", 10).notNull();
table.addColumn("taggable_type", "varchar", 32).default("");
```

### model.belongsToVia()

**signatures:**

- `belongsToVia(ModelClass: typeof Model, pivotTable: string, foreignKey1: string, foreignKey2: string): Model`

    *Defines a `belongs-to many` association via a pivot table.*
    - `pivotTable`  The name of the pivot table.
    - `foreignKey1` A foreign key in the pivot table that points to the 
        current model.
    - `foreignKey2` A foreign key in the pivot table that points to the 
        associated model.

- `belongsToVia(ModelClass: typeof Model, pivotTable: string, foreignKey1: string, foreignKey2: string, type: string): Model`

    *Defines a polymorphic `belongs-to many` association via a pivot table.*
    - `type` A field name in the pivot table that stores the associated model 
        name.

This method is `protected`, you must call it in the class when using 
TypeScript.

Please check the example at section [model.hasVia()](#model_hasVia).

### model.wherePivot()

*Sets extra `where...` clause when fetching data via a pivot table.*

**signatures:** (Since 3.0.4)

- `wherePivot(field: string, value: any): this`
- `wherePivot(field: string, operator: string, value: any): this`
- `wherePivot(fields: { [field: string]: any }): this`
- `wherePivot(nested: (query: Query) => void): this`

This method can only be called after calling `model.hasVia()` 
or `model.belongsToVia()`, and can be called only once.

Please check the example at section [model.hasVia()](#model_hasVia).

This method is very alike with [model.whereState()](#model_whereState), check 
its specification for more usage details.

### model.withPivot()

*Gets extra data from the pivot table.*

**signatures:**

- `withPivot(...fields: string[]): this`
- `withPivot(fields: string[]): this`

This method can only be called after calling `model.hasVia()`, 
`model.wherePivot()` or `model.belongsToVia()`.

Please check the example at section [model.hasVia()](#model_hasVia).

### model.associate()

*Makes an association to a specified model.*

**signatures:**

- `associate(id: number): Promise<Model>`
- `associate(model: Model): Promise<Model>`

This method can only be called after calling `model.belongsTo()`.

```typescript
(async () => {
    var user = await User.get(1);
    var artilce = await Article.get(1);
    
    await article.user.associate(user); // returns Promise<Article>
    // Or
    await article.user.associate(user.id); // NOT Promise<User>
})();
```

### model.dissociate()

*Removes the association bound by `model.associate()`.*

**signatures:**

- `dissociate(): Promise<Model>`

This method can only be called after calling `model.belongsTo()`.

```typescript
(async () => {
    var artilce = await Article.get(1);
    
    await article.user.dissociate(); // returns Promise<Article>
})();
```

### model.attach()

*Updates associations in a pivot table.*

**signatures:**

- `attach(ids: number[]): Promise<Model>`
- `attach(models: Model[]): Promise<Model>`
- `attach(pairs: { [id: number]: { [field: string]: any } }): Promise<Model>`

This method can only be called after calling `model.hasVia()` or 
`model.belongsToVia()`.

One thing to remember, this method will also delete those associations which 
are not provided in the `models`, so you must provide all models or IDs to the
argument every time you call this method.

```typescript
(async () => {
    var user = await User.get(1);
    var roles = await Role.all();

    // User attaches Roles:
    await user.roles.attach(roles); // Promise<User>
    
    // Role attaches Users:
    await role[0].users.attach(await User.all()); // Promise<Role>

    // Pass IDs:
    await user.roles.attach([1, 2, 3, 4]);

    // Pass extra data:
    await user.roles.attach({
        1: { activated: 1 },
        2: { activated: 0 },
        3: { activated: 0 },
        4: { activated: 0 }
    });
})();
```

### model.detach()

*Deletes associations in a pivot table.*

**signatures:**

- `detach(ids?: number[]): Promise<Model>`
- `detach(models?: Model[]): Promise<Model>`

This method can only be called after calling `model.hasVia()` or 
`model.belongsToVia()`.

```typescript
(async () => {
    var user = await User.get(1);
    var roles = await Role.all();

    await user.roles.detach(roles.slice(0, 2));
    // This is the same:
    await user.roles.attach(roles.slice(3, 4));

    // Pass IDs:
    await user.roles.detach([1, 2]);
    // This is the same:
    await user.roles.attach([3, 4]);

    // Detach all:
    await user.roles.detach();
})();
```
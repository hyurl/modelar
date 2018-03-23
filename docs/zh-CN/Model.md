
#### 内容列表

* [The Model Class](#The-Model-Class)
    * [事件](#事件)
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
    * [静态包装器](#静态包装器)
    * [自定义 Setter 和 Getter](#自定义-Setter-和-Getter)
    * [模型关联](#Model-Associations)
    * [model.has()](#model_has)
    * [model.belongsTo()](#model_belongsTo)
    * [model.hasThrough()](#model_hasThrough)
    * [model.belongsToThrough()](#model_belongsToThrough)
    * [model.hasVia()](#model_hasVia)
    * [model.belongsToVia()](#model_belongsToVia)
    * [model.withPivot()](#model_withPivot)
    * [model.associate()](#model_associate)
    * [model.dissociate()](#model_dissociate)
    * [model.attach()](#model_attach)
    * [model.detach()](#model_detach)

## Model 类

*模型包装器*

这个类继承于 Query 类，因此拥有所有 Query 所包含的特性，并且拥有 Query 所没有的其它
特性，它们使数据操作变得更加简单和高效。

同时，这个类实现了一些有用的 ES2015 API，如 `toString()`, `valueOf()`, `toJSON()`
和 `Symbol.iterator`，你可以调用 `model.toString()` 或 `JSON.stringify(model)`
来产生模型的字符串表示形式，也可以调用 `model.valueOf()` 来获取模型所包含的数据。
如果你想要列表出所有模型数据的属性，则可以将模型置于一个 for...of... 循环中，如这样：
`for(let [field, value] of model)`。

### 事件

- `save` 将会在一个模型即将被保存时触发。
- `saved` 将会在一个模型被成功保存后触发。

所有绑定到这些事件上的监听器函数都支持一个参数，即当前的 Model 实例。

### model.constructor()

*创建一个新实例。*

**signatures:**

- `new Model`
- `new Model(data: { [field: string]: any })`
- `new Model(data: { [field: string]: any }, config: ModelConfig)`

`ModelCOnfig` 接口包含：

- `table：string` 模型实例所绑定的数据表名称。
- `fields: string[]` 保存在一个数组中的数据表的字段名称。
- `primary: string` 数据表的主键名称。
- `searchable: string[]` 一个包含所有可用于搜索的字段的数组，它们可以在调用 
        `model.getMany()` 时用于模糊查询。

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

// 或者，你可以定义一个新的类来继承 Model 类，它将会更为方便，并且也是建议的。你也
// 可以定义只属于这个类的方法和属性。
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

// 现在你可以这样做：
var article = new Article({
    title: "A new article in Modelar circumstance.",
    content: "This is the content of the article.",
});

// 或者：
var article = new Article;
article.title = "A new article in Modelar circumstance.";
article.content = "This is the content of the article.";

// 当获取数据的时候，你可以这样做：
console.log(article.title);
console.log(article.content);
```

如果你使用 **TypeScript**, 你可以使用装饰器来定义模型类。

```typescript
import { Model, User, field, primary, searchable, autoIncrement } from "modelar";

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

建议你现在开始使用 TypeScript 来配合 Modelar 编程，它将会提供给你更多语言和模型的
特性。

### model.assign()

*分配数据到模型中。*

**signatures:**

- `assign(data: { [field: string]: any }, useSetter?: boolean): this`
    - `useSetter` 使用 Setter（如果有）来处理数据，默认为 `false`。

```javascript
const { User } = require("modelar");

// 通常地，有三种方式可以用来在模型中存放数据。
// 由于 User 继承于 Model，我将会用它来作为例子。
// 第一种，在实例化对象时传递数据：
var user = new User({
    name: "hyurl",
    email: "i@hyurl.com",
    password: "12345",
});

// 第二种，通过伪属性赋值：
user.name = "hyurl";
user.email = "i@hyurl.com";
user.password = "12345";

// 第三种，调用 assign() 方法：
user.assign({
    name: "hyurl",
    email: "i@hyurl.com",
    password: "12345",
});

// 前面两种会自动触发用户定义的 Setter，而第三种则不会，如果你希望它也触发 Settter，
// 则需要传递第二个参数为 `true` 到 assign() 中 ，像这样：
user.assign({
    name: "hyurl",
    email: "i@hyurl.com",
    password: "12345",
}, true);

// 另一个区别是，前面两种方式不能用来设置主键的值，而 assign() 方法可以。但这仅在当
// 你从数据库中获取了数据，然后想把它们存放在模型中时才是有帮助的（Model 类内部就
// 是这么做的），否则它只会产生问题。
user.assign({
    id: 1,
    name: "hyurl",
    email: "i@hyurl.com",
    password: "$2a$10$6Q4eEig4vJsEtCrmDb0CX.GAh/ZMWqd6St6jMYwKVD/bEzR2kfJqi",
});
```

### model.save()

*保存当前模型，如果数据库中不存在记录，那么它将会被自动插入。*

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

*将当前模型作为一个新记录插入到数据库中。*

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

*更新当前模型。*

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

*删除当前模型。*

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

// 或者直接这样：
user.delete(1).then(user=>{
    // ...
});
```

### model.get()

*从数据库中获取一个模型。*

**signatures:**

- `get(id?: number): Promise<this>`

如果没有找到模型，这个方法将会抛出一个错误。

```javascript
const { User } = require("modelar");

var user = new User;
user.where("id", 1).get().then(user=>{
    console.log(user);
}).catch(err=>{
    console.log(err);
})

// 或者直接这样：
user.get(1).then(user=>{
    console.log(user);
});
```

### model.all()

*从数据库中获取所有匹配的模型。*

**signatures:**

- `all(): Promise<this[]>`

如果没有找到模型，这个方法将会抛出一个错误。

```javascript
const { User } = require("modelar");

var user = new User;
user.all().then(users=>{
    // users 是一个携带着所有用户模型的数组。
    for(let _user of users){
        console.log(_user);
    }
}).catch(err=>{
    console.log(err);
})
```

### model.getMany()

*获取多个符合条件的模型。*

和 `model.all()` 不同，这个方法接受其它参数，并使用更简单的方式来产生复杂的 SQL 
语句，然后取得带有分页信息的模型数据。

**signatures:**

- `getMany(options?: ModelGetManyOptions): Promise<PaginatedModels>`

`ModelGetManyOptions` 接口包含：

- `page?: nnumber` 默认为 `1`。
- `limit?: number` 默认为 `10`。
- `orderBy?: string` 默认为模型的主键。
- `sequence?: "asc" | "desc" | "rand"` 默认为 `asc`。
- `keywords?: string | string[]` 用作模糊查询的关键词。
- `[field: string]: any` 其他条件.

`PaginatedModels` 接口包含：

- `page: number` 当前页码。
- `pages: number` 所有页码的数量。
- `limit: number` 每一页的上限。
- `total: number` 所有记录的数量。
- `orderBy?: string` 用于排序的字段。
- `sequence?: "asc" | "desc" | "rand"` 数据的排序方式。
- `keywords?: string | string[]` 用于模糊查询的关键词。
- `data: Model[]` 一个携带着所有获取到的模型的数组。

```javascript
const { User } = require("modelar");

var user = new User();
user.getMany({
    limit: 15, // 设置上限为 15
    sequence: "rand", // 设置为随机排序
    name: "hyurl", // 传递一个字段和值
    id: "<100", // 传递一个值和运算符
}).then(info=>{
    console.log(info);
}).catch(err=>{
    console.log(err);
});
```

从上面的例子，你可以看到，对于 `id`，我将它的值设置了一个运算符 `<`，这是一个非常
有用的技巧，在你需要搜索包含用于存储数字的字段的时候。所有支持的运算符包括：

- `<`
- `>`
- `<=`
- `>=`
- `!=`
- `<>`
- `=`

但是记住，当你使用这种方式传递一个参数的时候，在运算符和值之间是没有空格的。

### model.whereState()

*在更新或删除模型时为 SQL 语句设置一个额外的 where 字句来标记状态。*

**signatures:**

- `whereState(field: string, value: string | number | boolean | Date): this`
- `whereState(field: string, operator: string, value: string | number | boolean | Date): this`
- `whereState(fields: { [field: string]: string | number | boolean | Date }): this`

这个方法是为了使模型实现乐观锁，配合事务处理机制，我们可以在数据表中创建一个字段来保存
模型的状态。当更新或者删除模型时，检查这个状态，如果它满足条件，就意味着操作是成功的，
事务也就可以提交，否则，事务必须要回滚。

不像其他继承自 Query 的方法，这个方法只能使用一次，如果你调用这个方法多次，只有最后
一个状态是会被检测的。


```javascript
const { Model } = require("modelar/Model");

class Product extends Model {
    constructor(data = {}) {
        super(data, {
            table: "products",
            primary: "id",
            // `count` 是一个状态字段，表示着是否还有剩余的产品可用于交易。
            fields: ["id", "name", "price", "count"],
            searchable: ["name"]
        });
    }
}

// 开起事务
Product.transaction(product => {
    // 先获取产品
    return product.get(1).then(product => {
        if (product.count < 1) {
            throw new Error("This product has been sold out.");
        } else {
            // 假设每一次销售一件产品，这个 count 表示剩余产品数。
            product.count -= 1;
            // 保存产品并提交状态，在这种情况下，如果数量已经被其他的进程所修改为 0，
            // 那么这个操作就会失败，事务也将会被自动回滚。
            return product.whereState("count", ">", 0).save();
        }
    })
}).then(product => {
    console.log(`One product sold, ${product.count} left.`);
    // 注意，当更新了记录之后，模型会重新重数据库中获取记录，因此 `product.count`
    // 可能并不是你先前所操作的值，而是数据库中真实的值。
}).catch(err => {
    console.log(err);
});
```

### model.createTable()

*根据类定义来创建数据表。*

**签名：**

- `createTable(): Promise<this>`

这个方法仅在你使用 TypeScript 进行编程并使用**装饰器**来定义模型类时才有效。

## 静态包装器

现在，我们浏览过了大多数 Model 的特性，但是每一次使用它们时，我们都需要创建一个新的
实例，在很多情况下这非常不方便。针对这个原因，Modelar 提供了一些静态包装器，它们包含
绝大部分模型的方法，它们都会自动创建一个新的实例，你可以直接调用它们。

**这些方法是和它们的实例化版本如出一辙的：**

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
// 现在你可以使用静态方法来处理数据了。
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

### 自定义 Setter 和 Getter

通常地，模型会自动地为所有字段定义 setter 和 getter，但只有在它们还没有被定义的情况
下才会这样。所有出于某些特别的原因，你可以自己为一些字段定义 setter 和 getter，从而
可以使它们更适合你的需要。

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

    // password 的 setter，使用 BCrypt 来加密数据。
    set password(v) {
        // 模型的数据存储在 data 属性中。
        this.data.password = bcrypt.hashSync(v);
    }
    // password 的 getter，总是返回 undefined。
    // 当一个 getter 返回 undefined 时，那意味着当你调用 toString()、valueOf() 
    // 或者在 for...of... 循环中，这个属性将会消失。
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
// 将会像这样:
// {
//   name: 'test',
//   email: 'test@localhost',
//   password: '$2a$10$TNnqjq/ooTsCxPRgDKcbL.r0pW7vLQLs8/4BMOqafSLnqwAzm3MJa' 
// }

console.log(user.valueOf());
// 将会像这样:
// { name: 'test', email: 'test@localhost' }

console.log(user.toString());
// 将会像这样:
// {"name":"test", "email":"test@localhost"}

for(let [field, value] of user){
    console.log(field, value);
}
// 将会像这样:
// name test
// email test@localhost
```

## 模型关联

Modelar 提供了一些方法，可以让你将一个模型关联到其它模型上，通常地，你可以通过 
setter 定义一个属性，这个的属性可以使用这些方法来联合模型。在关联时，这些方法会产生
一个 `caller` 来调用被关联的模型，然后你就可以在当前模型中访问它们了。

### model.has()

*定义一个一对一或一对多关联。*

**signatures:**

- `has(ModelClass: typeof Model, foreignKey: string): Model` 

    *定义一个**一对一**或**一对多**关联。*
    - `foreignKey` 一个在被关联模型中的外键

- `has(ModelClass: typeof Model, foreignKey: string, type: string): Model`
    
    *定义一个多态的**一对一**或**一对多**关联。*
    - `type` 一个在被关联模型中的字段名，它保存着当前模型的名称。

这个方法是使用 `protected` 修饰的，当使用 TypeScript 时，必须在类中使用它。

```typescript
import { User as _User, field, primary, seachable, autoIncrement } from "modelar";

export class User extends _User {
    // 使用单词的复数形式只是为了表明这个用户有多篇文章，并不是说返回值是一个数组。
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

- `belongsTo(ModelClass: typeof Model, foreignKey: string): Model`

    *定义一个**附属**关联。*
    - `foreignKey` 一个在当前模型中的外键。

- `belongsTo(ModelClass: typeof Model, foreignKey: string, type: string): Model`

    *定义一个多态的**附属**关联。*
    - `type` 一个在当前模型中的字段名，它保存着被关联模型的名称。

这个方法是使用 `protected` 修饰的，当使用 TypeScript 时，必须在类中使用它。

请查看 [model.has()](#model_has) 章节中的示例。

### model.hasThrough()

*通过一个中间模型定义一个**一对一**或**一对多**关联。*

**signatures:**

- `hasThrough(ModelClass: typeof Model, MiddleClass: typeof Model, foreignKey1: string, foreignKey2: string): Model`

    - `MiddleClass` 中间模型类。
    - `foreignKey1` 一个在被关联模型中的指向中间模型的外键。
    - `foreignKey2` 一个在中间模型中的指向当前模型的外键。

这个方法是使用 `protected` 修饰的，当使用 TypeScript 时，必须在类中使用它。

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

*通过一个中间模型定义一个**附属**关联。*

**signatures:**

- `belongsToThrough(ModelClass: typeof Model, MiddleClass: typeof Model, foreignKey1: string, foreignKey2: string): Model`

    - `MiddleClass` 中间模型类。
    - `foreignKey1` 一个在当前模型中的指向中间模型的外键。
    - `foreignKey2` 一个在中间模型中的指向被关联模型的外键。

这个方法是使用 `protected` 修饰的，当使用 TypeScript 时，必须在类中使用它。

请查看 [model.hasThrough()](#model_hasThrough) 章节中的示例。

### model.hasVia()

- `hasVia(ModelClass: typeof Model, pivotTable: string, foreignKey1: string, foreignKey2: string): Model`

    *通过一个中间表定义一个**一对多**关联。*
    - `pivotTable` 中间表的名称。
    - `foreignKey1` 一个在中间表中的指向被关联模型的外键。
    - `foreignKey2` 一个在中间表中的指向当前模型的外键。

- `hasVia(ModelClass: typeof Model, pivotTable: string, foreignKey1: string, foreignKey2: string, type: string): Model`

    *通过一个中间表定义一个多态的**一对多**关联。*
    - `type` 一个在中间表中的键名，它保存着当前模型的名称。

这个方法是使用 `protected` 修饰的，当使用 TypeScript 时，必须在类中使用它。

```typescript
import { User as _User, Table, field, primary, seachable, autoIncrement } from "modelar";

export class User extends _User {
    @field("int", 10)
    country_id: number;

    get roles() {
        return <Role>this.hasVia(Role, "userroles", "role_id", "user_id").withPivot("activated");
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

*通过一个中间表定义一个附属的关联。*

**signatures:**

- `belongsToVia(ModelClass: typeof Model, pivotTable: string, foreignKey1: string, foreignKey2: string): Model`

    *通过一个中间表定义一个**一对多**的**附属**关联。*
    - `pivotTable`  中间表的名称。
    - `foreignKey1` 一个在中间表中的指向当前模型的外键。
    - `foreignKey2` 一个在中间表中的指向被关联模型的外键。

- `belongsToVia(ModelClass: typeof Model, pivotTable: string, foreignKey1: string, foreignKey2: string, type: string): Model`

    *通过一个中间表定义一个多态的**一对多**的**附属**关联。*
    - `type` 一个在中间表中的键名，它保存着被关联模型的名称。

这个方法是使用 `protected` 修饰的，当使用 TypeScript 时，必须在类中使用它。

请查看 [model.hasVia()](#model_hasVia) 章节中的示例。

### model.withPivot()

*获取中间表中的额外数据。*

**signatures:**

- `withPivot(...fields: string[]): this`
- `withPivot(fields: string[]): this`

这个方法只能在调用了 `model.hasVia()` 或 `model.belongsToVia()` 之后才被调用。

请查看 [model.hasVia()](#model_hasVia) 章节中的示例。

### model.associate()

*创建一个到指定模型的关联。*

**signatures:**

- `associate(id: number): Promise<Model>`
- `associate(model: Model): Promise<Model>`

这个方法只能在调用了 `model.belongsTo()` 之后才被调用。

```typescript
(async () => {
    var user = await User.get(1);
    var artilce = await Article.get(1);
    
    await article.user.associate(user); // 返回 Promise<Article>
    // Or
    await article.user.associate(user.id); // 而不是 Promise<User>
})();
```

### model.dissociate()

*移除一个由 `model.associate()` 绑定的关联。*

**signatures:**

- `dissociate(): Promise<Model>`

这个方法只能在调用了 `model.belongsTo()` 之后才被调用。

```typescript
(async () => {
    var artilce = await Article.get(1);
    
    await article.user.dissociate(); // 返回 Promise<Article>
})();
```

### model.attach()

*更新中间表中的关联。*

**signatures:**

- `attach(ids: number[]): Promise<Model>`
- `attach(models: Model[]): Promise<Model>`
- `attach(pairs: { [id: number]: { [field: string]: any } }): Promise<Model>`

这个方法只能在调用了 `model.hasVia()` 或 `model.belongsToVia()` 之后才被调用。

要记住一件事，这个方法会同时删除 `models` 所没有提供的关联，因此你必须在每一次调用该
方法时都提供所有的模型或者 ID。

```typescript
(async () => {
    var user = await User.get(1);
    var roles = await Role.all();

    // User 关联 Role：
    await user.roles.attach(roles); // Promise<User>
    
    // Role 关联 User：
    await role[0].users.attach(await User.all()); // Promise<Role>

    // 传递 ID：
    await user.roles.attach([1, 2, 3, 4]);

    // 传递额外的数据：
    await user.roles.attach({
        1: { activated: 1 },
        2: { activated: 0 },
        3: { activated: 0 },
        4: { activated: 0 }
    });
})();
```

### model.detach()

*删除中间表中的关联。*

**signatures:**

- `detach(ids: number[]): Promise<Model>`
- `detach(models: Model[]): Promise<Model>`

这个方法只能在调用了 `model.hasVia()` 或 `model.belongsToVia()` 之后才被调用。

```typescript
(async () => {
    var user = await User.get(1);
    var roles = await Role.all();

    // 移除部分关联：
    await user.roles.detach(roles.slice(0, 2));
    // 这是一样的：
    await user.roles.attach(roles.slice(3, 4));

    // 传递 ID：
    await user.roles.detach([1, 2]);
    // 这是一样的：
    await user.roles.attach([3, 4]);

    // 移除所有关联：
    await user.roles.detach();
})();
```
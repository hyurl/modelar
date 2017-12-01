
#### 内容列表

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
    * [静态包装器](#静态包装器)
    * [预定义事件](#预定义事件)
    * [自定义 Setter 和 Getter](#自定义-Setter-和-Getter)
    * [模型关联](#模型关联)
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

## Model 类

*模型包装器*

这个类继承于 Query 类，因此拥有所有 Query 所包含的特性，并且拥有 Query 所没有的其它
特性，它们使数据操作变得更加简单和高效。

同时，这个类实现了一些有用的 ES2015 API，如 `toString()`, `valueOf()`, `toJSON()`
和 `Symbol.iterator`，你可以调用 `model.toString()` 或 `JSON.stringify(model)`
来产生模型的字符串表示形式，也可以调用 `model.valueOf()` 来获取模型所包含的数据。
如果你想要列表出所有模型数据的属性，则可以将模型置于一个 for...of... 循环中，如这样：
`for(let [field, value] of model)`。

### model.constructor()

*创建一个新实例。*

**参数：**

- `[data]` 设置模型的初始数据。
- `[config]` 模型的初始配置，它们可以是：
    * `table` 模型实例所绑定的数据表名称。
    * `fields` 保存在一个数组中的数据表的字段名称。
    * `primary` 数据表的主键名称。
    * `searchable` 一个包含所有可用于搜索的字段的数组，它们可以在调用 
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

### model.assign()

*分配数据到模型中。*

**参数：**

- `data` 用于存储被分配数据的对象。
- `[useSetter]` 使用 Setter（如果有）来处理数据，默认为 `false`。

**返回值：**

返回当前对象以便实现方法的链式调用。

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

**返回值：**

返回一个 Promise，唯一一个传递到 `then()` 的回调函数中的参数是当前实例。

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

*参数：*

- `[data]` 一个携带着字段和值的对象。

**返回值：**

返回一个 Promise，唯一一个传递到 `then()` 的回调函数中的参数是当前实例。

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

*参数：*

- `[data]` 一个携带着字段和值的对象。

**返回值：**

返回一个 Promise，唯一一个传递到 `then()` 的回调函数中的参数是当前实例。

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

**参数：**

- `[id]` 模型的主键的值。

**返回值：**

返回一个 Promise，唯一一个传递到 `then()` 的回调函数中的参数是当前实例。

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

// 另外，你也可以直接这样做：
user.delete(1).then(user=>{
    console.log("User has been deleted.");
}).catch(err=>{
    console.log(err);
});
```

### model.get()

*从数据库中获取一个模型。*

**参数：**

- `[id]` 模型的主键的值。

**返回值：**

返回一个 Promise，唯一一个传递到 `then()` 的回调函数中的参数是当前实例。

如果没有找到模型，这个方法将会抛出一个错误。

```javascript
const { User } = require("modelar");

var user = new User;
user.where("id", 1).get().then(user=>{
    console.log(user);
}).catch(err=>{
    console.log(err);
})

// 另外，你也可以直接这样做：
user.get(1).then(user=>{
    console.log(user);
});
```

### model.all()

*从数据库中获取所有匹配的模型。*

**返回值：**

返回一个 Promise，唯一一个传递到 `then()` 的回调函数中的参数是当前实例。

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

*获取多个符合条件的模型。和 `model.all()` 不同，这个方法接受其它参数，并使用更简单*
*的方式来产生复杂的 SQL 语句，然后取得带有分页信息的模型数据。*

**参数：**

- `[args]` 一个对象，携带着字段的键值对信息，同时接受这些额外的属性：
    * `page` 当前页码，默认为 `1`。
    * `limit` 每一页的上限，默认是 `10`。
    * `orderBy` 通过指定的字段排序，默认是模型的主键。
    * `sequence` 数据的排序方式，可以是 `asc`、`desc` 或 `desc`，默认为 `asc`。
    * `keywords` 用作模糊查询的关键词，可以是一个字符串或者一个数组。

**返回值：**

返回一个 Promise，唯一一个传递到 `then()` 的回调函数中的参数是一个对象，它包含下面
这些信息：

- `page` 当前页码。
- `limit` 每一页的上限。
- `orderBy` 用于排序的字段。
- `sequence` 数据的排序方式。
- `keywords` 用于模糊查询的关键词。
- `pages` 所有页码的数量。
- `total` 所有记录的数量。
- `data` 一个携带着所有获取到的模型的数组。

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

从上面的例子，你可以看到，对于 `id`，我将它的值设置了一个运算符 `>`，这是一个非常
有用的技巧，在你需要搜索包含用于存储数字的字段的时候。所有支持的运算符包括：

- `<`
- `>`
- `<=`
- `>=`
- `!=`
- `<>`
- `=`

但是记住，当你使用这种方式传递一个参数的时候，在运算符和值之间是没有空格的。

## 静态包装器

现在，我们浏览过了大多数 Model 的特性，但是每一次使用它们时，我们都需要创建一个新的
实例，在很多情况下这非常不方便。针对这个原因，Modelar 提供了一些静态包装器，它们包含
绝大部分模型的方法，它们都会自动创建一个新的实例，你可以直接调用它们而不需要手动创建
实例。

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

### 预定义事件

在 Model 层面上，有这些你可以绑定处理器函数的事件：

- `query` 这个事件将会在一条 SQL 语句即将被执行时时触发。
- `insert` 这个事件将会在一个新模型即将被插入数据库时触发。
- `inserted` 这个事件将会在一个新模型被成功插入数据库后触发。
- `update` 这个事件将会在一个模型即将被更新时触发。
- `updated` 这个事件将会在一个模型被成功更新后触发。
- `save` 这个事件将会在一个模型即将被保存时触发。
- `saved` 这个事件将会在一个模型被成功保存后触发。
- `delete` 这个事件将会在一个模型即将被删除时触发。
- `deleted` 这个事件将会在一个模型被成功删除时触发。
- `get` 这个事件将会在一个模型被从数据库中成功取回时触发。

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
        // 模型的数据存储在 _data 属性中。
        this._data.password = bcrypt.hashSync(v);
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
console.log(user._data);
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

**参数：**

- `Model` 需要进行关联的模型类。
- `foreignKey` 被关联模型中的一个外键。
- `[typeKey]` 一个被关联模型中的字段，多态关联时用于保存当前模型的名称。

**返回值：**

返回被关联模型的实例以便能够使用它的特性来处理数据。

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
        // 传入 `typeKey` 来定义一个多态关联。
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
        // 传入 `typeKey` 来定义一个多态关联。
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

// 获取 ID 为 1 的用户
User.use(db).get(1).then(user => {
    // 打印用户数据
    console.log(user.valueOf());
    return user;
}).then(user => {
    // 获取用户的所有文章
    return user.articles.all().then(articles => {
        // 打印所有文章数据
        for (let article of articles) {
            console.log(article.valueOf());
        }

        return user;
    });
}).then(user => {
    // 获取用户的所有评论
    return user.comments.all().then(comments => {
        // 打印所有评论数据
        for (let comment of comments) {
            console.log(comment.valueOf());
        }

        return user;
    });
}).catch(err => {
    console.log(err);
});

// 获取 ID 为 1 的文章
Article.use(db).get(1).then(article => {
    // 打印文章数据
    console.log(article.valueOf());
    return article;
}).then(article => {
    // 获取文章大发布用户
    return article.user.get().then(user => {
        // 打印用户数据
        console.log(user.valueOf());
        return article;
    });
}).then(article => {
    // 获取文章的所有评论
    return article.comments.all().then(comments => {
        // 打印所有评论数据
        for (let comment of comments) {
            console.log(comment.valueOf());
        }

        return article;
    });
}).catch(err => {
    console.log(err);
});

// 获取 ID 为 1 的评论
Comment.use(db).get(1).then(comment => {
    // 打印评论
    console.log(comment.valueOf());
    return comment;
}).then(comment => {
    if (comment.commentable_type == "User") {
        // 获取评论的发表用户
        return comment.user.get().then(user => {
            // 打印用户
            console.log(user.valueOf());
            return comment;
        });
    } else if (comment.commentable_type == "Article") {
        // 获取评论的文章
        return comment.article.get().then(article => {
            // 打印文章
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

*定义一个附属的关联。*

**参数：**

- `Model` 需要进行关联的模型类。
- `foreignKey` 当前模型中的一个外键。
- `typeKey` 一个当前模型中的字段名称，多态关联时用于保存被关联模型的名称。

**返回值：**

返回被关联模型的实例以便能够使用它的特性来处理数据。

请查看 [model.has()](#model_has) 章节中的实例。

### model.hasThrough()

*通过一个中间模型定义一个一对一或一对多的关联。*

**参数：**

- `Model` 需要进行关联的模型类。
- `MiddleModel` 中间模型类。
- `foreignKey1` 一个在被关联模型中的指向中间模型的外键。
- `foreignKey2` 一个在中间模型中的指向当前模型的外键。

**返回值：**

返回被关联模型的实例以便能够使用它的特性来处理数据。

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

// 获取 ID 为 1 的国家
Country.use(db).get(1).then(country => {
    // 打印国家
    console.log(country.valueOf());

    return country.articles.all().then(articles => {
        // 打印所有的文章
        for (let article of articles) {
            console.log(article.valueOf());
        }
    });
}).catch(err => {
    console.log(err);
});

// 获取 ID 为 1 的文章
Article.use(db).get(1).then(article => {
    // 打印文章
    console.log(article.valueOf());

    // 获取文章的所属国家
    return article.country.get().then(country => {
        // 打印国家
        console.log(country.valueOf());
    });
}).catch(err => {
    console.log(err);
});
```

### model.belongsToThrough()

*通过一个中间模型定义一个附属的关联。*

**参数：**

- `Model` 需要进行关联的模型类。
- `MiddleModel` 中间模型类。
- `foreignKey1` 一个在当前模型中的指向中间模型的外键。
- `foreignKey2` 一个在中间模型中的指向被关联模型的外键。

**返回值：**

返回被关联模型的实例以便能够使用它的特性来处理数据。

请查看 [model.hasThrough()](#model_hasThrough) 章节中的实例。

### model.hasVia()

*通过一个中间表定义一个一对一或一对多关联。*

**参数：**

- `Model` 一个需要被关联的模型类。
- `pivotTable` 中间表的名称。
- `foreignKey1` 一个在中间表中的指向被关联模型的外键。
- `foreignKey2` 一个在中间表中的指向当前模型的外键。
- `[typeKey]` 一个在中间表中的键名，当你定义一个多态关联时保存着当前模型的名称。

**返回值：**

返回被关联模型的实例以便能够使用它的特性来处理数据。

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
        // 可选的，你可以使用：
        // return this.hasVia(User, "user_role", "user_id", "role_id");
        // 但是要注意参数顺序的不同，并且这只适合 `typeKey` 没有传入的情况下。
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
        return this.hasVia(
            Tag, "taggables", "tag_id", "taggable_id", "taggable_type");
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
        // 当传递 `typeKey` 时必须使用 model.belongsToVia()。
        return this.belongsToVia(User, "taggables", "tag_id", "taggable_id", "taggable_type");
    }

    get articles() {
        return this.belongsToVia(
            Article, "taggables", "tag_id", "taggable_id", "taggable_type");
    }
}

// 获取 ID 为 1 的用户
User.use(db).get(1).then(user => {
    // 打印用户的信息
    console.log(user.valueOf());

    // 获取用户的角色
    return user.roles.all().then(roles => {
        // 打印所有角色
        for (let role of roles) {
            console.log(role.valueOf());
        }

        return user;
    });
}).then(user => {
    // 获取用户的所有标签
    return user.tags.all().then(tags => {
        // 打印所有标签
        for (let tag of tags) {
            console.log(tag.valueOf());
        }
    });
}).catch(err => {
    console.log(err);
});

// 获取 ID 为 1 的文章
Article.use(db).get(1).then(article => {
    // 打印文章信息
    console.log(article.valueOf());

    // 获取文章的所有标签
    return article.tags.all().then(tags => {
        // 打印所有标签
        for (let tag of tags) {
            console.log(tag.valueOf());
        }

        return article;
    });
}).catch(err => {
    console.log(err);
});

// 获取 ID 为 1 的角色
Role.use(db).get(1).then(role => {
    // 打印角色信息
    console.log(role.valueOf());

    // 获取拥有该角色的所有用户
    return role.users.all().then(users => {
        // 打印所有用户
        for (let user of users) {
            console.log(user.valueOf());
        }

        return role;
    });
}).catch(err => {
    console.log(err);
});

// 获取 ID 为 1 的标签
Tag.use(db).get(1).then(tag => {
    // 打印标签信息
    console.log(tag.valueOf());

    // 获取拥有该标签的所有用户
    return tag.users.all().then(users => {
        // 打印所有用户
        for (let user of users) {
            console.log(user.valueOf());
        }

        return tag;
    })
}).then(tag => {
    // 获取拥有该标签的所有文章
    return tag.articles.all().then(articles => {
        // 打印所有文章
        for (let article of articles) {
            console.log(article.valueOf());
        }
    })
}).catch(err => {
    console.log(err);
});
```

### model.belongsToVia()

*通过一个中间表定义一个附属的关联。*

**参数：**

- `Model` 一个需要被关联的模型类。
- `pivotTable`  中间表的名称。
- `foreignKey1` 一个在中间表中的指向当前模型的外键。
- `foreignKey2` 一个在中间表中的指向被关联模型的外键。
- `[typeKey]` 一个在中间表中的键名，当你定义一个多态关联时保存着被关联模型的名称。

**返回值：**

返回被关联模型的实例以便能够使用它的特性来处理数据。

请查看 [model.hasVia()](#model_hasVia) 章节中的实例。

### model.associate()

*创建一个到指定模型的关联。*

**参数：**

- `model` 一个需要被关联的模型，或者一个表示模型主键值的数字。.

**返回值：**

返回一个 Promise，唯一一个传递到 `then()` 的回调函数中的参数是调用者实例。

这个方法只能在调用了 `model.belongsTo()` 之后才被调用。

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
        // 传递参数 `typeKey` 来定义一个堕胎关联。
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
        // 传递参数 `typeKey` 来定义一个堕胎关联。
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

// 获取 ID 为 1 的文章
Article.use(db).get(1).then(article => {
    // 打印文章信息
    console.log(article.valueOf());
    return article;
}).then(article => {
    // 将文章的作者关联为 ID 为 1 的用户
    return User.use(db).get(1).then(user => {
        return article.user.associate(user);
        // model.associate() 返回一个 Promise，唯一一个传递到 `then()` 的回调函数
        // 中的参数是调用者实例，在本例中则是 article。
    });
    // 或者你也可以直接传递一个 ID 到这个方法中：
    // return article.user.associate(1);
}).then(article => {
    // 获取文章的作者
    return article.user.get().then(user => {
        // 打印用户信息
        console.log(user.valueOf());

        return article;
    });
}).catch(err => {
    console.log(err);
});

// 获取 ID 为 1 的评论
Comment.use(db).get(1).then(comment => {
    // 打印评论信息
    console.log(comment.valueOf());
    return comment;
}).then(comment => {
    // 将评论的作者关联为 ID 为 1 的用户
    return User.use(db).get(1).then(user => {
        return comment.user.associate(user);
    });
    // 或者你也可以直接传递一个 ID 到这个方法中：
    // return article.user.associate(1);
}).then(comment => {
    // 获取该评论的作者
    return comment.user.get().then(user => {
        // 打印用户信息
        console.log(user.valueOf());

        return comment;
    });
}).catch(err => {
    console.log(err);
});
```

### model.dissociate()

*移除一个由 `model.associate()` 绑定的关联。*

**返回值：**

返回一个 Promise，唯一一个传递到 `then()` 的回调函数中的参数是调用者实例。

这个方法只能在调用了 `model.belongsTo()` 之后才被调用。

这个方法和 [model.associate()](#model_associate) 很相似，请查看上面的文章。

### model.attach()

*更新中间表中的关联。*

- `models` 一个数组，携带着所有的需要关联的模型或者表示模型主键值的数字。另外，也
    可以设置这个参数为一个对象，它的键名代表着模型的主键值，而它的值则设置中间表中
    额外的数据。

**返回值：**

返回一个 Promise，唯一一个传递到 `then()` 的回调函数中的参数是调用者实例。

这个方法只能在调用了 `model.hasVia()` 或 `model.belongsToVia()` 之后才被调用。

要记住一件事，这个方法会同时删除 `models` 所没有提供的关联，因此你必须在每一次调用该
方法时都提供所有的模型或者 ID。

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
        // 或者你也可以这样做：
        // return this.belongsToVia(User, "user_role", "role_id", "user_id");
        // 但是需要注意参数顺序的不同。
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

// 获取 ID 为 1 的用户
User.use(db).get(1).then(user => {
    // 打印用户信息
    console.log(user.valueOf());

    // 更新用户角色的关联
    return user.roles.attach([1, 2, 3]);
    // 你也许想要尝试下面这种方式，如果你有一个 `activated` 在中间表 `user_role` 
    // 中:
    //  return user.roles.attach({
    //      1: { activated: 1 },
    //      2: { activated: 1 },
    //      3: { activated: 0 }
    //  });
}).then(user => {
    // 获取用户的所有角色
    return user.roles.all().then(roles => {
        // 打印所有角色
        for (let role of roles) {
            console.log(role.valueOf());
        }

        return user;
    });
}).then(user => {
    // 关联所有标签到用户上
    return Tag.use(db).all().then(tags=>{
        return user.tags.attach(tags);
    });
}).then(user => {
    // 获取用户的所有标签
    return user.tags.all().then(tags => {
        // 打印所有标签
        for (let tag of tags) {
            console.log(tag.valueOf());
        }
    });
}).catch(err => {
    console.log(err);
});

// 获取 ID 为 1 的用户
Role.use(db).get(1).then(role => {
    // 打印角色信息
    console.log(role.valueOf());

    // 更新角色和用户的关联
    return role.users.attach([1, 2, 3]);
}).then(role => {
    // 获取拥有该角色的所有用户
    return role.users.all().then(users => {
        // 打印所有用户
        for (let user of users) {
            console.log(user.valueOf());
        }

        return role;
    });
}).catch(err => {
    console.log(err);
});

// 获取 ID 为 1 的标签
Tag.use(db).get(1).then(tag => {
    // 打印标签信息
    console.log(tag.valueOf());

    // 更新标签和用户的关联
    return tag.users.attach([1, 2, 3]);
}).then(tag => {
    // 获取拥有该表签的所有用户
    return tag.users.all().then(users => {
        // 打印所有用户
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

*删除中间表中的关联。*

**参数：**

- `[models]` 一个数组，携带着所有的需要删除关联的模型或者表示模型主键值的数字。如果
    这个参数没有被提供，那么所有在中间表中的关联都会被删除。

**返回值：**

返回一个 Promise，唯一一个传递到 `then()` 的回调函数中的参数是调用者实例。

这个方法只能在调用了 `model.hasVia()` 或 `model.belongsToVia()` 之后才被调用。

这个方法和 [model.attach()](#model_attach) 很相似，请查看上面的文章。

### model.withPivot()

*获取中间表中的额外数据。*

**参数：**

- `fields` 一个包含所有目标字段的列表，每一个字段传递为一个参数，或者只传递第一个
    参数为一个包含所有字段名称的数组。

**返回值：**

返回当前对象以便实现方法的链式调用。

这个方法只能在调用了 `model.hasVia()` 或 `model.belongsToVia()` 之后才被调用。


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

// 获取 ID 为 1 的角色
Role.use(db).get(1).then(role => {
    // 获取所有拥有该角色的用户
    return role.users.all();
}).then(users => {
    for (let user of users) {
        // 当从中间表获取到数据后，这些数据将会被保存到 model._extra 属性中。
        console.log(user.valueOf(), user._extra);
    }
}).catch(err => {
    console.log(err);
});
```

### model.whereState()

<small>(自 1.0.2 起)</small>
*在更新或删除模型时为 SQL 语句设置一个额外的 where 字句来标记状态。*

**参数：**

- `field` 这可以是一个字段名，或者使用一个对象来同时设置多个 `=`（相等）条件。或者
    传递一个回调函数来产生嵌套的条件子句，唯一一个传递到回调函数中的参数是一个新的
    Query 对象。
- `[operator]` 条件运算符，如果 `value` 没有被传入，那么这个参数将替换它，而运算符
    将变成一个 `=`。另外也可以将这个参数传递为一个回调函数来产生一个 SQL 子查询语句，
    唯一一个传递到回调函数中的参数是一个新的 Query 实例，从而可以用它的特性来产生 
    SQL 语句。
- `[value]` 一个用来与 `field` 进行比较的值，如果这个参数没有传递，那么将用 
    `operator` 替换它，而运算符将变成一个 `=`。

**返回值：**

放回当前实例以便实现方法的链式调用。

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
# Modelar

**An expressive Model with Promise functionality and Query constructor.**

See the [API documentation](http://modelar.hyurl.com:3000) at hyurl.com.

## Install

To install Modelar in you project, just type the following command in you 
shell or CMD:

```sh
npm install modelar --save
```

## Supported Database

This module currently supports these Databases:

- `SQLiet` with module [sqlite3](https://www.npmjs.com/package/sqlite3 "npm install sqlite3 --save").
- `MySQL` with module [mysql](https://www.npmjs.com/package/mysql "npm install mysql --save").
- `PostgreSQL` with module [pg](https://www.npmjs.com/package/pg "npm install pg --save").

Modelar won't install any of these modules automatically, because they are not
dependencies technically, but if you want to use Modelar, you have to install 
them manually, just install what you need, and leave others alone.

Modelar is still in developing period, and more database will be supported in 
the future version.

## What can I do with this module?

* **Write less code.**
    * You can just define a class that extends the Model, and most of the 
    work would be done for you.
    * Promise guarantees that all the procedures can be controlled within one 
    logic.
* **Write expressive and good looking code.**
    * Attributes of a model is actually properties of the instance.
    * All setter and getter supports.
* **Use query constructors to handle data.**
    * This module provides most of the SQL supports to the Model.
    * Query constructor provides an Object-Oriented way to generate SQL 
    statements.
* **Control database connections.**
    * The DB class provides an internal pool to automatically manage
    connections.
    * Transaction is very easy to use, the program will automatically commit 
    or rollback for you.

## Example

```javascript
const DB = require("modelar/DB"); //Import DB support.
const Model = require("modelar"); //import base Model.

DB.init({ //configure database
    database: "./modelar.db",
});

//Add a global event handler to every models.
Model.on("save", model=>{
    console.log(model.toString())
});

//Define a new class that extends the Model.
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

//Create a new DB instance, so that all models can share its connection.
var db = new DB;

//Create a new article.
var article = new Article;
article.title = "A new article in Modelar circumstance.";
article.content = "This is the content of the article.";

//Save the article.
article.use(db).save().then(article=>{
    console.log("Article is saved with id: " + article.id + ".");
}).catch(err=>{ //Catch the error if any presents.
    console.log(err);
});

//if you want to retrieve an article form the database, just do:
Article.use(db).get(1).then(article=>{ //Get the article which id is 1.
    console.log(article.valueOf());
}).catch(err=>{
    console.log(err);
});
```

Above gives a very simple example that shows the convenience and expressive 
functionality that this module has, you can go into the real depth of it by 
checking the [API documentation](http://modelar.hyurl.com:3000).

## SQL or NoSQL?

This is a very popular question in recent days, since some non-relational 
databases like MangoDB has been very developed in these years, some people 
would say that why we're still using SQL statements. The question is, what 
benefits can we get from relational databases and are missing in 
non-relational databases? Sure there are a lot. Say you want to join some 
records in table A when fetching records from table B, this very simple in 
relational databases, just use a `inner join` clause, and it is OK. But in 
non-relational databases, judging by the name you will know that they don't 
have such an ability to do so, because they are **not related**. It would take
a long time and effort to achieve such goals by programing, which isn't 
suitable for large projects and short-time developments. Since **Modelar** is 
aimed at developing strong web applications, it just focus on SQL.
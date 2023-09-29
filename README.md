# Modelar

**An expressive ORM with query builder and supports multiple databases.**

Check out the API documentation in the [Wiki](https://github.com/hyurl/modelar/wiki).

## Prerequisites

- `NodeJS` version higher than 4.0.0.

## Install

To install Modelar in you project, just type the following command in your 
shell or CMD:

```sh
npm install modelar --save
```

## Supported Databases

This module currently supports these databases:

- `MySQL/MariaDB` see [modelar-mysql-adapter](https://github.com/hyurl/modelar-mysql-adapter).
- `PostgreSQL` see [modelar-postgres-adapter](https://github.com/hyurl/modelar-postgres-adapter).
- `SQLite` see [modelar-sqlite-adapter](https://github.com/hyurl/modelar-sqlite-adapter).
- `MicroSoft SQL Server` see [modelar-mssql-adapter](https://github.com/hyurl/modelar-mssql-adapter).
- `OracleDB` see [modelar-oracle-adapter](https://github.com/hyurl/modelar-oracle-adapter).
- `DB2` see [modelar-ibmdb-adapter](https://github.com/hyurl/modelar-ibmdb-adapter).

Not all adapters are installed automatically, only `MySQL/MariaDB` (since 
3.0.4) are internally included, you must manually install other adapters if 
you want to use them.

## What can I do with this module?

* **Write less code.**
    * You can just define a class that extends the Model, and most of the 
        work would be done for you.
    * Promise guarantees that all the procedures can be controlled within one 
        logic.
* **Write expressive and good looking code.**
    * Attributes of a model is actually properties of the instance.
    * All setter and getter supports.
* **Write one piece of code, run everywhere.**
    * Modelar exposes a common API that provides consistency across databases.
    * You can just write a piece of code, and run it with all the databases 
        supported, and don't have to worry the behavior of different 
        databases.
* **Use Query Builder to handle data.**
    * This module provides most of the SQL supports to the Model.
    * Query builder provides an Object-Oriented way to generate SQL statements.

Modelar is still growing, more features might be introduced in future 
versions.

## Example

```javascript
const { DB, Model } = require("modelar");

DB.init({
    type: "mysql", // Could be 'mysql', 'maria' or 'postgres' by default.
    database: "modelar",
    host: "127.0.0.1",
    port: 3306,
    user: "root",
    password: "161301"
});

// Add a global event handler to every queries.
DB.on("query", model=>{
    console.log(model.toString())
});

// Define a new class that extends the Model.
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

(async () => {
    var db = null;
    try {
        db = new DB();

        // Create a new table `articles`:

        var table = new Table("articles");
        table.addColumn("id").primary().autoIncrement();
        table.addColumn("title", "varchar", 255).notNull();
        table.addColumn("content", "varchar", 1024).notNull();

        table = await table.use(db).save();
        console.log(table);
        console.log("");

        // Insert an article into the database with 'Article' model:
        
        var article = new Article;
        article.title = "A new article in Modelar circumstance.";
        article.content = "This is the content of the article.";
        
        article = await article.use(db).save();
        console.log(article);
    } catch (e) {
        console.log(e);
    }

    if (db)
        db.close();
})();
```

Above gives a very simple example that shows the convenience and expressive 
functionality that this package carries, you can go into the real depth of it 
by checking the [API documentation](https://github.com/hyurl/modelar/wiki).

This package is written in TypeScript and compiled to ES5 standard (since 
3.0.4) with some ES2015 features, so it can run in any version of NodeJS that 
higher than 4.0.0. But this feature relies on the support of the adapter 
you're using, so check the specification of the adapter carefully.

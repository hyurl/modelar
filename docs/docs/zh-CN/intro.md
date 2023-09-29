## 前提条件

- `NodeJS` 版本高于 4.0.0。

## 安装

要在你的项目中安装 Modelar，只需要在你的 Shell 或者 CMD 中输入下面的命令：

```sh
npm install modelar --save
```

## 支持的数据库

这个模块当前支持这些数据库：

- `MySQL/MariaDB` see [modelar-mysql-adapter](https://github.com/Hyurl/modelar-mysql-adapter).
- `PostgreSQL` see [modelar-postgres-adapter](https://github.com/Hyurl/modelar-postgres-adapter).
- `SQLite` see [modelar-sqlite-adapter](https://github.com/Hyurl/modelar-sqlite-adapter).
- `MicroSoft SQL Server` see [modelar-mssql-adapter](https://github.com/Hyurl/modelar-mssql-adapter).
- `OracleDB` see [modelar-oracle-adapter](https://github.com/Hyurl/modelar-oracle-adapter).
- `DB2` see [modelar-ibmdb-adapter](https://github.com/Hyurl/modelar-ibmdb-adapter).

不是所有的适配器都被自动安装的，只有 `MySQL/MariaDB`（自 3.0.4 起）是内置包含的，
你必须要手动安装其他的适配器，如果你打算使用它们。

Modelar 依旧在成长，更多的特性可能会在未来版本中被引入。

## 我可以用这个模块做什么？

* **编写更少的代码**
    * 你可以仅定义一个简单的类来扩展 Model 类，然后其他大部分工作都会自动帮你完成。
    * Promise 特性保证了所有的过程都会在一个程序逻辑下得到控制。
* **书写富于表现和好看的代码**
    * 模型的属性即实例的属性。
    * 完全的 Settter 和 Getter 支持。
* **只写一份代码，在任何地方运行**
    * Modelar 暴露了一个通用的 API，它提供了跨数据库的一致性。
    * 你可以仅编写一份代码，就能够在所有支持的数据库上运行，而不用担心不同数据库的
        不同表现。
* **使用查询语句构造器来处理数据**
    * 这个模块为模型提供了大部分 SQL 支持。
    * 查询语句构造器提供了一个面向对象的方式来生成 SQL 语句。

## 示例

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

上面只是给出了一个非常简单的例子，来显示出这个模块所拥有的便捷性以及表现型，你可以深入
并真正了解它，请用心查看这份文档。

这个包是使用 TypeScript 编写的，并编译成 ES5 标准（自 3.0.4 版本起），同时包含一些
ES2015 的新特性，因此它可以运行再任何版本高于 4.0.0 的 NodeJS 环境中。但这个特性依赖
于你所使用的适配器程序的支持，因此请仔细查阅该适配器程序的说明。
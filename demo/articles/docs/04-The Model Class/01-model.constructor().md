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
const Model = require("modelar");

var article = new Model({
    title: "A new article in Modelar circumstance.",
    content: "This is the content of the article.",
}, {
    table: "articles",
    fields: [ "id", "title", "content" ],
    primary: "id",
    serachable: [ "title", "content" ]
});

//Alternatively, you can define a new class extends the Model, it would be 
//more convenient and it is recommended. You can define methods and properties
//of that class of its own.
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

//Now you can do:
var article = new Article({
    title: "A new article in Modelar circumstance.",
    content: "This is the content of the article.",
});

//Or:
var article = new Article;
article.title = "A new article in Modelar circumstance.";
article.content = "This is the content of the article.";

//When getting data, you can do:
console.log(article.title);
console.log(article.content);
```
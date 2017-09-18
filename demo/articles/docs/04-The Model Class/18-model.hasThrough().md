### model.hasThrough()

*Defines a has (many) association through a middle model.*

**parameters:**

- `Model` A model class that needs to be associated.
- `MiddleModel` The class of the middle model. 
- `foreignKey1` A foreign key in the associated model that points to the 
    middle model.
- `foreignKey2` A foreign key in the middle model that points to the current 
    model.

**return**

Returns the associated model instance so you can use its features to handle 
data.

```javascript
const DB = require("modelar/DB");
const Model = require("modelar/Model");

var db = new DB("./modelar.db");

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
        //Print put all articles.
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
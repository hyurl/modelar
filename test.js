const DB = require("./supports/DB");
const Model = require("./Model");

DB.init({
    type: "sqlite",
    database: "./demo/modelar.db",
});

var db = (new DB).connect();

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
}

Country.use(db).get(1).then(country => {
    return country.articles.all();
}).then(articles => {
    for (let article of articles) {
        console.log(article);
    }
}).catch(err => {
    console.log(err);
});
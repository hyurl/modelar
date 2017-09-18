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
const DB = require("modelar/DB");
const Model = require("modelar/Model");

var db = new DB("./modelar.db");

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
        //Pass the argument `typeKey` to define a polymorphic association.
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
        //Pass the argument `typeKey` to define a polymorphic association.
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

//Get the user of whose ID is 1.
User.use(db).get(1).then(user => {
    //Print out the user's data.
    console.log(user.valueOf());
    return user;
}).then(user => {
    //Get all articles of the user.
    return user.articles.all().then(articles => {
        //Print out all articles' data.
        for (let article of articles) {
            console.log(article.valueOf());
        }

        return user;
    });
}).then(user => {
    //Get all comments of the user.
    return user.comments.all().then(comments => {
        //Print out all comments' data.
        for (let comment of comments) {
            console.log(comment.valueOf());
        }

        return user;
    });
}).catch(err => {
    console.log(err);
});

//Get the article of which 's ID is 1.
Article.use(db).get(1).then(article => {
    //Print out the article's data.
    console.log(article.valueOf());
    return article;
}).then(article => {
    //Get the user the of the article.
    return article.user.get().then(user => {
        //Print out the user's data.
        console.log(user.valueOf());
        return article;
    });
}).then(article => {
    //Get all comments of the article.
    return article.comments.all().then(comments => {
        //Print out all comments' data.
        for (let comment of comments) {
            console.log(comment.valueOf());
        }

        return article;
    });
}).catch(err => {
    console.log(err);
});

//Get the comment of which ID is 1.
Comment.use(db).get(1).then(comment => {
    //Print out the comment.
    console.log(comment.valueOf());
    return comment;
}).then(comment => {
    if (comment.commentable_type == "User") {
        //Get the user of the comment.
        return comment.user.get().then(user => {
            //Print out the user.
            console.log(user.valueOf());
            return comment;
        });
    } else if (comment.commentable_type == "Article") {
        //Get the article of the comment.
        return comment.article.get().then(article => {
            //Print out the article.
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
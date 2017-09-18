### model.associate()

*Makes an association to a specified model.*

**parameters:**

- `model` A model that needs to be associated or a number that represents the 
    value of the model's primary key.

**return:**

Returns a Promise, and the the only argument passed to the callback of 
`then()` is the caller instance.

This method can only be called after calling `model.belongsTo()`.

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

//Get the article of which 's ID is 1.
Article.use(db).get(1).then(article => {
    //Print out the article's data.
    console.log(article.valueOf());
    return article;
}).then(article => {
    //Associate the article's user to the user whose ID is 1.
    return User.use(db).get(1).then(user => {
        return article.user.associate(user);
        //model.associate() returns a Promise, and the only argument passed to
        //that Promise.then() is the caller instance, which in this case, is 
        //the article.
    });
    //Alternatively you could just pass the ID to the method.
    //return article.user.associate(1);
}).then(article => {
    //Get the user of the article.
    return article.user.get().then(user => {
        //Print out all comments' data.
        console.log(user.valueOf());

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
    //Associate the comment's user to the user whose ID is 1.
    return User.use(db).get(1).then(user => {
        return comment.user.associate(user);
    });
    //Alternatively you could just pass the ID to the method.
    //return comment.user.associate(1);
}).then(comment => {
    //Get the user of the comment.
    return comment.user.get().then(user => {
        //Print out all comments' data.
        console.log(user.valueOf());

        return comment;
    });
}).catch(err => {
    console.log(err);
});
```
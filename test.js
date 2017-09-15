const DB = require("./supports/DB");
const Model = require("./Model");

DB.init({
    type: "sqlite",
    database: "./demo/modelar.db",
});

var db = (new DB).connect();

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
        return this.has(Comment, "commentable_id", "commentable_type");
    }

    get tags() {
        return this.hasVia(Tag, "taggables", "tag_id", "taggable_id", "taggable_type");
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
        return this.has(Comment, "commentable_id", "commentable_type");
    }

    get tags() {
        return this.hasVia(Tag, "taggables", "tag_id", "taggable_id", "taggable_type");
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
        return this.belongsTo(User, "commentable_id");
    }

    get article() {
        return this.belongsTo(Article, "commentable_id");
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

// //Get the user of whose ID is 1.
// User.use(db).get(1).then(user => {
//     //Print out the user's data.
//     console.log(user.valueOf());

//     //Get all articles of the user.
//     return user.articles.all().then(articles => {
//         //Print out all articles' data.
//         for (let article of articles) {
//             console.log(article.valueOf());
//         }

//         //Get all comments of the user.
//         return user.comments.all().then(comments => {
//             //Print out all comments' data.
//             for (let comment of comments) {
//                 console.log(comment.valueOf());
//             }

//             return user;
//         });
//     });
// }).catch(err => {
//     console.log(err);
// });

// // //Get the article of which's ID is 1.
// Article.use(db).get(1).then(article => {
//     //Print out the article's data.
//     console.log(article.valueOf());

//     //Get the user the of the article.
//     return article.user.get().then(user => {
//         //Print out the user's data.
//         console.log(user.valueOf());

//         //Get all comments of the article.
//         return article.comments.all().then(comments => {
//             //Print out all comments' data.
//             for (let comment of comments) {
//                 console.log(comment.valueOf());
//             }

//             return article;
//         });
//     });
// }).catch(err => {
//     console.log(err);
// });

// //Get all comments.
// Comment.use(db).all().then(comments => {
//     var index = 0,
//         //Walk through all comments in a recursive loop.
//         loop = comment => {
//             if (comment !== undefined) {
//                 //Print out the comment's data;
//                 console.log(comment.valueOf());

//                 index += 1;
//                 if (comment.commentable_type == "User") {
//                     //Get the user which the comment belongs to.
//                     return comment.user.get().then(user => {
//                         //Print out the user's data;
//                         console.log(user.valueOf());

//                         return loop(comments[index]);
//                     });
//                 } else if (comment.commentable_type == "Article") {
//                     //Get the article which the comment belongs to.
//                     return comment.article.get().then(article => {
//                         //Print out the article's data.
//                         console.log(article.valueOf());

//                         return loop(comments[index]);
//                     });
//                 } else {
//                     return loop(comments[index]);
//                 }
//             } else {
//                 return comments;
//             }
//         };

//     return loop(comments[index]);
// }).catch(err => {
//     console.log(err);
// });

//Get the user of whose ID is 1.
// User.use(db).get(1).then(user => {
//     //Create a new article.
//     var article = new Article;
//     article.title = "A test article.";
//     article.content = "Test content.";
// Article.use(db).get(1).then(user => {
//     user.tags.all().then(tags => {
//         console.log(tags);
//     })
// });
Tag.on("query", tag => {
    console.log(tag.sql, tag.bindings);
})
Tag.use(db).get(1).then(tag => {
    return tag.users.all().then(users => {
        console.log(users);
    })
}).catch(err => {
    console.log(err);
})

// return article.user.associate(user, "user_id").then(article => {
//     //Print out the article.
//     console.log(article);

//     //Create a comment.
//     var comment = new Comment;
//     comment.content = "A test comment to the User.";
//     return comment.associate(user, "commentable_id", "commentable_type");
// });
// }).catch(err => {
//     console.log(err);
// });
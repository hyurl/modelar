### model.hasVia()

*Defines a has (many) association via a pivot table.*

**parameters:**

- `Model` A model class that needs to be associated.
- `pivotTable` The name of the pivot table.
- `foreignKey1` A foreign key in the pivot table that points to the associated
    model.
- `foreignKey2` A foreign key in the pivot table that points to the current 
    model.
- `[typeKey]` A field name in the pivot table that stores the current model 
    name when you are defining a polymorphic association.

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
        //Alternatively, you can call:
        // return this.hasVia(User, "user_role", "user_id", "role_id");
        //But be aware of the different sequence of arguments.
        //And this is only for the situation that the argument `typeKey` is 
        //not passed.
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
        //Must use model.belongsToVia() when passing the argument `typeKey`.
        return this.belongsToVia(
            User, "taggables", "tag_id", "taggable_id", "taggable_type");
    }

    get articles() {
        return this.belongsToVia(
            Article, "taggables", "tag_id", "taggable_id", "taggable_type");
    }
}

//Get the user of whose ID is 1.
User.use(db).get(1).then(user => {
    //Print out the user's data.
    console.log(user.valueOf());

    //Get all roles of the user.
    return user.roles.all().then(roles => {
        //Print out all roles.
        for (let role of roles) {
            console.log(role.valueOf());
        }

        return user;
    });
}).then(user => {
    //Get all tags of the user.
    return user.tags.all().then(tags => {
        //Print out all tags.
        for (let tag of tags) {
            console.log(tag.valueOf());
        }
    });
}).catch(err => {
    console.log(err);
});

//Get the article of which ID is 1.
Article.use(db).get(1).then(article => {
    //Print out the article.
    console.log(article.valueOf());

    //Get all tags of the article.
    return article.tags.all().then(tags => {
        //Print out all tags.
        for (let tag of tags) {
            console.log(tag.valueOf());
        }

        return article;
    });
}).catch(err => {
    console.log(err);
});

//Get the role of which ID is 1.
Role.use(db).get(1).then(role => {
    //Print out the role.
    console.log(role.valueOf());

    //Get all users of the role.
    return role.users.all().then(users => {
        //Print out all users.
        for (let user of users) {
            console.log(user.valueOf());
        }

        return role;
    });
}).catch(err => {
    console.log(err);
});

//Get the tag of which ID is 1.
Tag.use(db).get(1).then(tag => {
    //print out the tag.
    console.log(tag.valueOf());

    //Get all users of the tag.
    return tag.users.all().then(users => {
        //Print out all users.
        for (let user of users) {
            console.log(user.valueOf());
        }

        return tag;
    })
}).then(tag => {
    //Get all articles of the tag.
    return tag.articles.all().then(articles => {
        //Print out all articles.
        for (let article of articles) {
            console.log(article.valueOf());
        }
    })
}).catch(err => {
    console.log(err);
});
```
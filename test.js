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
        return this.hasVia(User, "user_role", "user_id", "role_id");
        //Alternatively, you can call:
        // return this.belongsToVia(User, "user_role", "role_id", "user_id");
        //But be aware of the different sequence of arguments.
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
        return this.belongsToVia(
            User, "taggables", "tag_id", "taggable_id", "taggable_type");
    }
}

DB.on("query", db => {
    console.log(db.sql, db.bindings);
})

//Get the user of whose ID is 1.
User.use(db).get(1).then(user => {
    //Print out the user's data.
    console.log(user.valueOf());

    //Update associations of user's roles.
    // return user.roles.attach([1, 2, 3]);
    //You may also want to try this out if you have a field `activated` in the
    //pivot table `user_role`:
    return user.roles.attach({
        1: { activated: 1 },
        2: { activated: 1 },
        3: { activated: 1 }
    });
}).then(user => {
    //Get all roles of the user.
    return user.roles.all().then(roles => {
        //Print out all roles.
        for (let role of roles) {
            console.log(role.valueOf());
        }

        return user;
    });
}).then(user => {
    //Associate all tags to the user.
    return Tag.use(db).all().then(tags => {
        return user.tags.attach(tags);
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

//Get the role of which ID is 1.
// Role.use(db).get(1).then(role => {
//     //Print out the role.
//     console.log(role.valueOf());

//     //Update associations of the role's users.
//     return role.users.attach([1, 2, 3]);
// }).then(role => {
//     //Get all users of the role.
//     return role.users.all().then(users => {
//         //Print out all users.
//         for (let user of users) {
//             console.log(user.valueOf());
//         }

//         return role;
//     });
// }).catch(err => {
//     console.log(err);
// });

// //Get the tag of which ID is 1.
// Tag.use(db).get(1).then(tag => {
//     //print out the tag.
//     console.log(tag.valueOf());

//     //Update associations of the tag's users.
//     return tag.users.attach([1, 2, 3]);
// }).then(tag => {
//     //Get all users of the tag.
//     return tag.users.all().then(users => {
//         //Print out all users.
//         for (let user of users) {
//             console.log(user.valueOf());
//         }

//         return tag;
//     })
// }).catch(err => {
//     console.log(err);
// });
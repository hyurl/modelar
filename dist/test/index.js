"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Article_1 = require("./Article");
const Comment_1 = require("./Comment");
const create_tables_1 = require("./create-tables");
const create_user_1 = require("./create-user");
const create_articles_1 = require("./create-articles");
const create_comments_1 = require("./create-comments");
const login_user_1 = require("./login-user");
const create_countries_1 = require("./create-countries");
const create_tags_1 = require("./create-tags");
const create_roles_1 = require("./create-roles");
const Role_1 = require("./Role");
const Tag_1 = require("./Tag");
const Country_1 = require("./Country");
const db = require("modelar/test/db");
(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
    try {
        yield create_tables_1.createTables();
        yield create_user_1.createUser();
        yield create_countries_1.createCounties();
        yield create_articles_1.createArticles();
        yield create_comments_1.createComments();
        yield create_tags_1.createTags();
        yield create_roles_1.createRoles();
        var user = yield login_user_1.loginUser();
        var country = yield Country_1.Country.use(db).get(1);
        yield user.country.associate(country);
        var country = yield user.country.get();
        console.log(user.valueOf());
        console.log(country.valueOf());
        var users = yield country.users.all();
        for (const user of users) {
            console.log(user.valueOf());
        }
        var articles = yield Article_1.Article.use(db).all();
        for (const article of articles) {
            yield article.user.associate(user);
        }
        articles = yield country.articles.all();
        for (const article of articles) {
            console.log(article.valueOf());
        }
        var roles = yield Role_1.Role.use(db).all();
        yield user.roles.attach(roles);
        roles = yield user.roles.all();
        for (const role of roles) {
            console.log(role.valueOf());
        }
        users = yield roles[0].users.all();
        for (const user of users) {
            console.log(user.valueOf());
        }
        var tags = yield Tag_1.Tag.use(db).all();
        yield user.tags.attach(tags);
        tags = yield user.tags.all();
        for (const tag of tags) {
            console.log(tag.valueOf());
        }
        users = yield tags[0].users.all();
        for (const user of users) {
            console.log(user.valueOf());
        }
        articles = yield users[0].articles.all();
        for (const article of articles) {
            console.log(article.valueOf());
            yield article.tags.attach(tags);
        }
        articles = yield tags[0].articles.all();
        for (const article of articles) {
            console.log(article.valueOf());
        }
        var comments = yield Comment_1.Comment.use(db).all();
        for (const comment of comments) {
            console.log(comment.valueOf());
            if (comment.id % 2) {
                yield comment.user.associate(user);
            }
            else {
                yield comment.article.associate(articles[0]);
            }
        }
        user = yield comments[0].user.get();
        console.log(user.valueOf());
        var article = yield comments[1].article.get();
        console.log(article.valueOf());
        yield user.roles.detach(roles);
        yield user.tags.detach(tags.slice(1, 3));
        yield comments[0].user.dissociate();
        yield comments[1].article.dissociate();
        yield tags[0].articles.detach();
        yield article.tags.detach();
        console.log("All procedures are run properly.");
    }
    catch (e) {
        console.log(e);
    }
    db.close();
}))();
//# sourceMappingURL=index.js.map
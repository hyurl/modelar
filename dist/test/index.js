"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Article_1 = require("./Article");
const Comment_1 = require("./Comment");
const db_1 = require("./db");
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
(async () => {
    try {
        await create_tables_1.createTables();
        await create_user_1.createUser();
        await create_countries_1.createCounties();
        await create_articles_1.createArticles();
        await create_comments_1.createComments();
        await create_tags_1.createTags();
        await create_roles_1.createRoles();
        var user = await login_user_1.loginUser();
        var country = await Country_1.Country.use(db_1.db).get(1);
        await user.country.associate(country);
        var country = await user.country.get();
        console.log(user.valueOf());
        console.log(country.valueOf());
        var users = await country.users.all();
        for (const user of users) {
            console.log(user.valueOf());
        }
        var articles = await Article_1.Article.use(db_1.db).all();
        for (const article of articles) {
            await article.user.associate(user);
        }
        articles = await country.articles.all();
        for (const article of articles) {
            console.log(article.valueOf());
        }
        var roles = await Role_1.Role.use(db_1.db).all();
        await user.roles.attach(roles);
        roles = await user.roles.all();
        for (const role of roles) {
            console.log(role.valueOf());
        }
        users = await roles[0].users.all();
        for (const user of users) {
            console.log(user.valueOf());
        }
        var tags = await Tag_1.Tag.use(db_1.db).all();
        await user.tags.attach(tags);
        tags = await user.tags.all();
        for (const tag of tags) {
            console.log(tag.valueOf());
        }
        users = await tags[0].users.all();
        for (const user of users) {
            console.log(user.valueOf());
        }
        articles = await users[0].articles.all();
        for (const article of articles) {
            console.log(article.valueOf());
            await article.tags.attach(tags);
        }
        articles = await tags[0].articles.all();
        for (const article of articles) {
            console.log(article.valueOf());
        }
        var comments = await Comment_1.Comment.use(db_1.db).all();
        for (const comment of comments) {
            console.log(comment.valueOf());
            if (comment.id % 2) {
                await comment.user.associate(user);
            }
            else {
                await comment.article.associate(articles[0]);
            }
        }
        user = await comments[0].user.get();
        console.log(user.valueOf());
        var article = await comments[1].article.get();
        console.log(article.valueOf());
        await user.roles.detach(roles);
        await user.tags.detach(tags.slice(1, 3));
        await comments[0].user.dissociate();
        await comments[1].article.dissociate();
        await tags[0].articles.detach();
        await article.tags.detach();
    }
    catch (e) {
        console.log(e);
    }
    db_1.db.close();
})();
//# sourceMappingURL=index.js.map
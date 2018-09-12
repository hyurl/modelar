import { DB } from "modelar";
import { Article } from "./Article";
import { Comment } from "./Comment";
import { createTables } from "./create-tables";
import { createUser } from "./create-user";
import { createArticles } from "./create-articles";
import { createComments } from "./create-comments";
import { loginUser } from "./login-user";
import { createCounties } from "./create-countries";
import { createTags } from "./create-tags";
import { createRoles } from "./create-roles";
import { Role } from "./Role";
import { Tag } from "./Tag";
import { Country } from "./Country";
import { User } from "./User";
const db: DB = require("modelar/test/db");

(async () => {
    try {
        await createTables();
        await createUser();
        await createCounties();
        await createArticles();
        await createComments();
        await createTags();
        await createRoles();

        var user = await loginUser();
        var country = await Country.use<Country>(db).get(1);

        await user.country.associate<User>(country);

        var country = await user.country.get();

        console.log(user.valueOf());
        console.log(country.valueOf());

        var users = await country.users.all();
        for (const user of users) {
            console.log(user.valueOf());
        }

        var articles = await Article.use<Article>(db).all();
        for (const article of articles) {
            await article.user.associate<Article>(user);
        }

        articles = await country.articles.all();
        for (const article of articles) {
            console.log(article.valueOf());
        }

        var roles = await Role.use<Role>(db).all();

        await user.roles.attach<Role>(roles);

        roles = await user.roles.all();
        for (const role of roles) {
            console.log(role.valueOf());
        }

        users = await roles[0].users.all();
        for (const user of users) {
            console.log(user.valueOf());
        }

        var tags = await Tag.use<Tag>(db).all();

        await user.tags.attach<User>(tags);

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
            await article.tags.attach<Article>(tags);
        }

        articles = await tags[0].articles.all();
        for (const article of articles) {
            console.log(article.valueOf());
        }

        var comments = await Comment.use<Comment>(db).all();
        for (const comment of comments) {
            console.log(comment.valueOf());

            if (comment.id % 2) {
                await comment.user.associate<Comment>(user);
            } else {
                await comment.article.associate<Comment>(articles[0]);
            }
        }

        user = await comments[0].user.get();
        console.log(user.valueOf());

        var article = await comments[1].article.get();
        console.log(article.valueOf());

        await user.roles.detach<User>(roles);
        await user.tags.detach<User>(tags.slice(1, 3));
        await comments[0].user.dissociate<Comment>();
        await comments[1].article.dissociate<Comment>();
        await tags[0].articles.detach<Tag>();
        await article.tags.detach<Article>();

        console.log("All procedures are run properly.");
    } catch (e) {
        console.log(e);
    }

    db.close();
})();
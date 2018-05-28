var assert = require("assert");
var Query = require("../").Query;

describe("Query.prototype.join()", function () {
    describe("join(table: string, field1: string, field2: string)", function () {
        var query = new Query("users").select("*");
        it("should generate SQL that joins two tables", function () {
            query.join("articles", "users.id", "articles.user_id");
            assert.equal(query.getSelectSQL(), "select * from `users` inner join `articles` on `users`.`id` = `articles`.`user_id`");
        });

        it("should generate SQL that joins three tables", function () {
            query.join("comments", "users.id", "comments.user_id");
            assert.equal(query.getSelectSQL(), "select * from (`users` inner join `articles` on `users`.`id` = `articles`.`user_id`) inner join `comments` on `users`.`id` = `comments`.`user_id`");
        });

        it("should generate SQL that joins four tables", function () {
            query.join("pictures", "users.id", "pictures.user_id");
            assert.equal(query.getSelectSQL(), "select * from ((`users` inner join `articles` on `users`.`id` = `articles`.`user_id`) inner join `comments` on `users`.`id` = `comments`.`user_id`) inner join `pictures` on `users`.`id` = `pictures`.`user_id`");
        });
    });

    describe("join(table: string, field1: string, operator: string, field2: string)", function () {
        it("should generate SQL that joins two tables with operator '>'", function () {
            var query = new Query("users").select("*");
            query.join("articles", "users.id", ">", "articles.user_id");
            assert.equal(query.getSelectSQL(), "select * from `users` inner join `articles` on `users`.`id` > `articles`.`user_id`");
        });
    });

    describe("join(table: string, fields: { [field: string]: string })", function () {
        it("should generate SQL that joins two tables with multiple field comparisons", function () {
            var query = new Query("users").select("*");
            query.join("articles", {
                "users.id": query.field("articles.user_id"),
                "users.gender": "male"
            });
            assert.equal(query.getSelectSQL(), "select * from `users` inner join `articles` on `users`.`id` = `articles`.`user_id` and `users`.`gender` = ?");
            assert.deepEqual(query["_bindings"], ["male"])
        });
    });

    describe("join(table: string, nested: (query: Query) => void)", function () {
        it("should generate SQL that joins two tables via a nest query", function () {
            var query = new Query("users").select("*");
            query.join("articles", function (_query) {
                _query.where("users.id", query.field("articles.user_id"))
                    .where("users.gender", "male");
            });
            assert.equal(query.getSelectSQL(), "select * from `users` inner join `articles` on `users`.`id` = `articles`.`user_id` and `users`.`gender` = ?");
            assert.deepEqual(query["_bindings"], ["male"])
        });
    });
});

describe("Query.prototype.leftJoin()", function () {
    describe("leftJoin(table: string, field1: string, field2: string)", function () {
        it("should generate SQL that joins two tables", function () {
            var query = new Query("users").select("*");
            query.leftJoin("articles", "users.id", "articles.user_id");
            assert.equal(query.getSelectSQL(), "select * from `users` left join `articles` on `users`.`id` = `articles`.`user_id`");
        });
    });

    describe("leftJoin(table: string, field1: string, operator: string, field2: string)", function () {
        it("should generate SQL that joins two tables with operator '>'", function () {
            var query = new Query("users").select("*");
            query.leftJoin("articles", "users.id", ">", "articles.user_id");
            assert.equal(query.getSelectSQL(), "select * from `users` left join `articles` on `users`.`id` > `articles`.`user_id`");
        });
    });

    describe("leftJoin(table: string, fields: { [field: string]: string })", function () {
        it("should generate SQL that joins two tables with multiple field comparisons", function () {
            var query = new Query("users").select("*");
            query.leftJoin("articles", {
                "users.id": query.field("articles.user_id"),
                "users.gender": "male"
            });
            assert.equal(query.getSelectSQL(), "select * from `users` left join `articles` on `users`.`id` = `articles`.`user_id` and `users`.`gender` = ?");
            assert.deepEqual(query["_bindings"], ["male"])
        });
    });

    describe("leftJoin(table: string, nested: (query: Query) => void)", function () {
        it("should generate SQL that joins two tables via a nest query", function () {
            var query = new Query("users").select("*");
            query.leftJoin("articles", function (_query) {
                _query.where("users.id", query.field("articles.user_id"))
                    .where("users.gender", "male");
            });
            assert.equal(query.getSelectSQL(), "select * from `users` left join `articles` on `users`.`id` = `articles`.`user_id` and `users`.`gender` = ?");
            assert.deepEqual(query["_bindings"], ["male"])
        });
    });
});

describe("Query.prototype.rightJoin()", function () {
    describe("rightJoin(table: string, field1: string, field2: string)", function () {
        it("should generate SQL that joins two tables", function () {
            var query = new Query("users").select("*");
            query.rightJoin("articles", "users.id", "articles.user_id");
            assert.equal(query.getSelectSQL(), "select * from `users` right join `articles` on `users`.`id` = `articles`.`user_id`");
        });
    });

    describe("rightJoin(table: string, field1: string, operator: string, field2: string)", function () {
        it("should generate SQL that joins two tables with operator '>'", function () {
            var query = new Query("users").select("*");
            query.rightJoin("articles", "users.id", ">", "articles.user_id");
            assert.equal(query.getSelectSQL(), "select * from `users` right join `articles` on `users`.`id` > `articles`.`user_id`");
        });
    });

    describe("rightJoin(table: string, fields: { [field: string]: string })", function () {
        it("should generate SQL that joins two tables with multiple field comparisons", function () {
            var query = new Query("users").select("*");
            query.rightJoin("articles", {
                "users.id": query.field("articles.user_id"),
                "users.gender": "male"
            });
            assert.equal(query.getSelectSQL(), "select * from `users` right join `articles` on `users`.`id` = `articles`.`user_id` and `users`.`gender` = ?");
            assert.deepEqual(query["_bindings"], ["male"])
        });
    });

    describe("rightJoin(table: string, nested: (query: Query) => void)", function () {
        it("should generate SQL that joins two tables via a nest query", function () {
            var query = new Query("users").select("*");
            query.rightJoin("articles", function (_query) {
                _query.where("users.id", query.field("articles.user_id"))
                    .where("users.gender", "male");
            });
            assert.equal(query.getSelectSQL(), "select * from `users` right join `articles` on `users`.`id` = `articles`.`user_id` and `users`.`gender` = ?");
            assert.deepEqual(query["_bindings"], ["male"])
        });
    });
});

describe("Query.prototype.fullJoin()", function () {
    describe("fullJoin(table: string, field1: string, field2: string)", function () {
        it("should generate SQL that joins two tables", function () {
            var query = new Query("users").select("*");
            query.fullJoin("articles", "users.id", "articles.user_id");
            assert.equal(query.getSelectSQL(), "select * from `users` full join `articles` on `users`.`id` = `articles`.`user_id`");
        });
    });

    describe("fullJoin(table: string, field1: string, operator: string, field2: string)", function () {
        it("should generate SQL that joins two tables with operator '>'", function () {
            var query = new Query("users").select("*");
            query.fullJoin("articles", "users.id", ">", "articles.user_id");
            assert.equal(query.getSelectSQL(), "select * from `users` full join `articles` on `users`.`id` > `articles`.`user_id`");
        });
    });

    describe("fullJoin(table: string, fields: { [field: string]: string })", function () {
        it("should generate SQL that joins two tables with multiple field comparisons", function () {
            var query = new Query("users").select("*");
            query.fullJoin("articles", {
                "users.id": query.field("articles.user_id"),
                "users.gender": "male"
            });
            assert.equal(query.getSelectSQL(), "select * from `users` full join `articles` on `users`.`id` = `articles`.`user_id` and `users`.`gender` = ?");
            assert.deepEqual(query["_bindings"], ["male"])
        });
    });

    describe("fullJoin(table: string, nested: (query: Query) => void)", function () {
        it("should generate SQL that joins two tables via a nest query", function () {
            var query = new Query("users").select("*");
            query.fullJoin("articles", function (_query) {
                _query.where("users.id", query.field("articles.user_id"))
                    .where("users.gender", "male");
            });
            assert.equal(query.getSelectSQL(), "select * from `users` full join `articles` on `users`.`id` = `articles`.`user_id` and `users`.`gender` = ?");
            assert.deepEqual(query["_bindings"], ["male"])
        });
    });
});

describe("Query.prototype.crossJoin()", function () {
    describe("crossJoin(table: string, field1: string, field2: string)", function () {
        it("should generate SQL that joins two tables", function () {
            var query = new Query("users").select("*");
            query.crossJoin("articles", "users.id", "articles.user_id");
            assert.equal(query.getSelectSQL(), "select * from `users` cross join `articles` on `users`.`id` = `articles`.`user_id`");
        });
    });

    describe("crossJoin(table: string, field1: string, operator: string, field2: string)", function () {
        it("should generate SQL that joins two tables with operator '>'", function () {
            var query = new Query("users").select("*");
            query.crossJoin("articles", "users.id", ">", "articles.user_id");
            assert.equal(query.getSelectSQL(), "select * from `users` cross join `articles` on `users`.`id` > `articles`.`user_id`");
        });
    });

    describe("crossJoin(table: string, fields: { [field: string]: string })", function () {
        it("should generate SQL that joins two tables with multiple field comparisons", function () {
            var query = new Query("users").select("*");
            query.crossJoin("articles", {
                "users.id": query.field("articles.user_id"),
                "users.gender": "male"
            });
            assert.equal(query.getSelectSQL(), "select * from `users` cross join `articles` on `users`.`id` = `articles`.`user_id` and `users`.`gender` = ?");
            assert.deepEqual(query["_bindings"], ["male"])
        });
    });

    describe("crossJoin(table: string, nested: (query: Query) => void)", function () {
        it("should generate SQL that joins two tables via a nest query", function () {
            var query = new Query("users").select("*");
            query.crossJoin("articles", function (_query) {
                _query.where("users.id", query.field("articles.user_id"))
                    .where("users.gender", "male");
            });
            assert.equal(query.getSelectSQL(), "select * from `users` cross join `articles` on `users`.`id` = `articles`.`user_id` and `users`.`gender` = ?");
            assert.deepEqual(query["_bindings"], ["male"])
        });
    });
});
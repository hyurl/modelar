const assert = require("assert");
const { Query } = require("../");

describe("Query.prototype.join()", () => {
    describe("join(table: string, field1: string, field2: string)", () => {
        let query = new Query("users").select("*");
        it("should generate SQL that joins two tables", () => {
            query.join("articles", "users.id", "articles.user_id");
            assert.equal(query.getSelectSQL(), "select * from `users` inner join `articles` on `users`.`id` = `articles`.`user_id`");
        });

        it("should generate SQL that joins three tables", () => {
            query.join("comments", "users.id", "comments.user_id");
            assert.equal(query.getSelectSQL(), "select * from (`users` inner join `articles` on `users`.`id` = `articles`.`user_id`) inner join `comments` on `users`.`id` = `comments`.`user_id`");
        });

        it("should generate SQL that joins four tables", () => {
            query.join("pictures", "users.id", "pictures.user_id");
            assert.equal(query.getSelectSQL(), "select * from ((`users` inner join `articles` on `users`.`id` = `articles`.`user_id`) inner join `comments` on `users`.`id` = `comments`.`user_id`) inner join `pictures` on `users`.`id` = `pictures`.`user_id`");
        });
    });

    describe("join(table: string, field1: string, operator: string, field2: string)", () => {
        it("should generate SQL that joins two tables with operator '>'", () => {
            let query = new Query("users").select("*");
            query.join("articles", "users.id", ">", "articles.user_id");
            assert.equal(query.getSelectSQL(), "select * from `users` inner join `articles` on `users`.`id` > `articles`.`user_id`");
        });
    });

    describe("join(table: string, fields: { [field: string]: string })", () => {
        it("should generate SQL that joins two tables with multiple field comparisons", () => {
            let query = new Query("users").select("*");
            query.join("articles", {
                "users.id": query.field("articles.user_id"),
                "users.gender": "male"
            });
            assert.equal(query.getSelectSQL(), "select * from `users` inner join `articles` on `users`.`id` = `articles`.`user_id` and `users`.`gender` = ?");
            assert.deepEqual(query["_bindings"], ["male"])
        });
    });

    describe("join(table: string, nested: (query: Query) => void)", () => {
        it("should generate SQL that joins two tables via a nest query", () => {
            let query = new Query("users").select("*");
            query.join("articles", _query => {
                _query.where("users.id", query.field("articles.user_id"))
                    .where("users.gender", "male");
            });
            assert.equal(query.getSelectSQL(), "select * from `users` inner join `articles` on `users`.`id` = `articles`.`user_id` and `users`.`gender` = ?");
            assert.deepEqual(query["_bindings"], ["male"])
        });
    });
});

describe("Query.prototype.leftJoin()", () => {
    describe("leftJoin(table: string, field1: string, field2: string)", () => {
        it("should generate SQL that joins two tables", () => {
            let query = new Query("users").select("*");
            query.leftJoin("articles", "users.id", "articles.user_id");
            assert.equal(query.getSelectSQL(), "select * from `users` left join `articles` on `users`.`id` = `articles`.`user_id`");
        });
    });

    describe("leftJoin(table: string, field1: string, operator: string, field2: string)", () => {
        it("should generate SQL that joins two tables with operator '>'", () => {
            let query = new Query("users").select("*");
            query.leftJoin("articles", "users.id", ">", "articles.user_id");
            assert.equal(query.getSelectSQL(), "select * from `users` left join `articles` on `users`.`id` > `articles`.`user_id`");
        });
    });

    describe("leftJoin(table: string, fields: { [field: string]: string })", () => {
        it("should generate SQL that joins two tables with multiple field comparisons", () => {
            let query = new Query("users").select("*");
            query.leftJoin("articles", {
                "users.id": query.field("articles.user_id"),
                "users.gender": "male"
            });
            assert.equal(query.getSelectSQL(), "select * from `users` left join `articles` on `users`.`id` = `articles`.`user_id` and `users`.`gender` = ?");
            assert.deepEqual(query["_bindings"], ["male"])
        });
    });

    describe("leftJoin(table: string, nested: (query: Query) => void)", () => {
        it("should generate SQL that joins two tables via a nest query", () => {
            let query = new Query("users").select("*");
            query.leftJoin("articles", _query => {
                _query.where("users.id", query.field("articles.user_id"))
                    .where("users.gender", "male");
            });
            assert.equal(query.getSelectSQL(), "select * from `users` left join `articles` on `users`.`id` = `articles`.`user_id` and `users`.`gender` = ?");
            assert.deepEqual(query["_bindings"], ["male"])
        });
    });
});

describe("Query.prototype.rightJoin()", () => {
    describe("rightJoin(table: string, field1: string, field2: string)", () => {
        it("should generate SQL that joins two tables", () => {
            let query = new Query("users").select("*");
            query.rightJoin("articles", "users.id", "articles.user_id");
            assert.equal(query.getSelectSQL(), "select * from `users` right join `articles` on `users`.`id` = `articles`.`user_id`");
        });
    });

    describe("rightJoin(table: string, field1: string, operator: string, field2: string)", () => {
        it("should generate SQL that joins two tables with operator '>'", () => {
            let query = new Query("users").select("*");
            query.rightJoin("articles", "users.id", ">", "articles.user_id");
            assert.equal(query.getSelectSQL(), "select * from `users` right join `articles` on `users`.`id` > `articles`.`user_id`");
        });
    });

    describe("rightJoin(table: string, fields: { [field: string]: string })", () => {
        it("should generate SQL that joins two tables with multiple field comparisons", () => {
            let query = new Query("users").select("*");
            query.rightJoin("articles", {
                "users.id": query.field("articles.user_id"),
                "users.gender": "male"
            });
            assert.equal(query.getSelectSQL(), "select * from `users` right join `articles` on `users`.`id` = `articles`.`user_id` and `users`.`gender` = ?");
            assert.deepEqual(query["_bindings"], ["male"])
        });
    });

    describe("rightJoin(table: string, nested: (query: Query) => void)", () => {
        it("should generate SQL that joins two tables via a nest query", () => {
            let query = new Query("users").select("*");
            query.rightJoin("articles", _query => {
                _query.where("users.id", query.field("articles.user_id"))
                    .where("users.gender", "male");
            });
            assert.equal(query.getSelectSQL(), "select * from `users` right join `articles` on `users`.`id` = `articles`.`user_id` and `users`.`gender` = ?");
            assert.deepEqual(query["_bindings"], ["male"])
        });
    });
});

describe("Query.prototype.fullJoin()", () => {
    describe("fullJoin(table: string, field1: string, field2: string)", () => {
        it("should generate SQL that joins two tables", () => {
            let query = new Query("users").select("*");
            query.fullJoin("articles", "users.id", "articles.user_id");
            assert.equal(query.getSelectSQL(), "select * from `users` full join `articles` on `users`.`id` = `articles`.`user_id`");
        });
    });

    describe("fullJoin(table: string, field1: string, operator: string, field2: string)", () => {
        it("should generate SQL that joins two tables with operator '>'", () => {
            let query = new Query("users").select("*");
            query.fullJoin("articles", "users.id", ">", "articles.user_id");
            assert.equal(query.getSelectSQL(), "select * from `users` full join `articles` on `users`.`id` > `articles`.`user_id`");
        });
    });

    describe("fullJoin(table: string, fields: { [field: string]: string })", () => {
        it("should generate SQL that joins two tables with multiple field comparisons", () => {
            let query = new Query("users").select("*");
            query.fullJoin("articles", {
                "users.id": query.field("articles.user_id"),
                "users.gender": "male"
            });
            assert.equal(query.getSelectSQL(), "select * from `users` full join `articles` on `users`.`id` = `articles`.`user_id` and `users`.`gender` = ?");
            assert.deepEqual(query["_bindings"], ["male"])
        });
    });

    describe("fullJoin(table: string, nested: (query: Query) => void)", () => {
        it("should generate SQL that joins two tables via a nest query", () => {
            let query = new Query("users").select("*");
            query.fullJoin("articles", _query => {
                _query.where("users.id", query.field("articles.user_id"))
                    .where("users.gender", "male");
            });
            assert.equal(query.getSelectSQL(), "select * from `users` full join `articles` on `users`.`id` = `articles`.`user_id` and `users`.`gender` = ?");
            assert.deepEqual(query["_bindings"], ["male"])
        });
    });
});

describe("Query.prototype.crossJoin()", () => {
    describe("crossJoin(table: string, field1: string, field2: string)", () => {
        it("should generate SQL that joins two tables", () => {
            let query = new Query("users").select("*");
            query.crossJoin("articles", "users.id", "articles.user_id");
            assert.equal(query.getSelectSQL(), "select * from `users` cross join `articles` on `users`.`id` = `articles`.`user_id`");
        });
    });

    describe("crossJoin(table: string, field1: string, operator: string, field2: string)", () => {
        it("should generate SQL that joins two tables with operator '>'", () => {
            let query = new Query("users").select("*");
            query.crossJoin("articles", "users.id", ">", "articles.user_id");
            assert.equal(query.getSelectSQL(), "select * from `users` cross join `articles` on `users`.`id` > `articles`.`user_id`");
        });
    });

    describe("crossJoin(table: string, fields: { [field: string]: string })", () => {
        it("should generate SQL that joins two tables with multiple field comparisons", () => {
            let query = new Query("users").select("*");
            query.crossJoin("articles", {
                "users.id": query.field("articles.user_id"),
                "users.gender": "male"
            });
            assert.equal(query.getSelectSQL(), "select * from `users` cross join `articles` on `users`.`id` = `articles`.`user_id` and `users`.`gender` = ?");
            assert.deepEqual(query["_bindings"], ["male"])
        });
    });

    describe("crossJoin(table: string, nested: (query: Query) => void)", () => {
        it("should generate SQL that joins two tables via a nest query", () => {
            let query = new Query("users").select("*");
            query.crossJoin("articles", _query => {
                _query.where("users.id", query.field("articles.user_id"))
                    .where("users.gender", "male");
            });
            assert.equal(query.getSelectSQL(), "select * from `users` cross join `articles` on `users`.`id` = `articles`.`user_id` and `users`.`gender` = ?");
            assert.deepEqual(query["_bindings"], ["male"])
        });
    });
});
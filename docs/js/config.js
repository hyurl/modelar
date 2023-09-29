var Desc = {
    "en-US": {
        jumbotronDesc: "An expressive ORM with query builder and supports multiple databases.",
        fast: "Fast",
        fastDesc: "Modelar is tiny but powerful, it extremely improves your development efficiency, uses only few lines of code to achieve complicated missions.",
        easy: "Easy",
        easyDesc: "Modelar provides a lot of features that let you code and handle data in a very easy and clear way, allows you taking more focus on expressing your site.",
        functional: "Functional",
        functionalDesc: "Multi-DB Supports, Query Builder and Table Creator, Model Inheritance and Associations, Promise Ability and Event Listeners, all mean to reduce your work."
    },
    "zh-CN": {
        jumbotronDesc: "一个富有表现力的 ORM，拥有查询语句建构器并支持多种数据库类型。",
        fast: "快速",
        fastDesc: "Modelar 是精巧和强大的，它极大地提高了开发的效率，使用简单的几句代码，就能够完成复杂的任务。",
        easy: "简洁",
        easyDesc: "Modelar 提供了大量的特性，使你能够用非常简洁明晰的方式来编写代码和操控数据，让你能够更专注于如何展现你的网站。",
        functional: "功能强大",
        functionalDesc: "多数据库支持、查询建构器与表建构器、模型继承与关联、Promise 功能和事件处理机制，这一切，都旨在减少你的工作。",
    }
};

var isZH = Lang == "zh-CN";

window.locals = {
    icp: "桂ICP备15001693号",
    module: "modelar",
    moduleName: "Modelar",
    lang: isZH ? "?lang=en-US" : "?lang=zh-CN",
    langLabel: isZH ? "English (US)" : "中文 (简体)",
    year: (new Date).getFullYear(),
    navbarMenu: {
        "/": isZH ? "主页" : "Home",
        "/docs/": isZH ? "文档" : "Documenation",
        "https://github.com/hyurl/modelar": isZH ? "源代码" : "Source Code",
    },
    sidebarMenu: {
        intro: {
            label: isZH ? "简介" : "Introduction",
            title: "Introduction"
        },
        DB: {
            label: isZH ? "DB 类" : "The DB class",
            title: "DB"
        },
        Table: {
            label: isZH ? "Table 类" : "The Table class",
            title: "Table"
        },
        Query: {
            label: isZH ? "Query 类" : "The Query class",
            title: "Query"
        },
        Model: {
            label: isZH ? "Model 类" : "The Model class",
            title: "Model"
        },
        User: {
            label: isZH ? "User 类" : "The User class",
            title: "User"
        },
        decorators: {
            label: isZH ? "装饰器" : "Decorators",
            title: "Decorators"
        },
        advanced: {
            label: isZH ? "高级教程" : "Advanced",
            title: "Advanced"
        },
        "migration-guide": {
            label: isZH ? "迁移向导" : "Migration Guide",
            title: "Migration Guide"
        }
    },
};

Object.assign(window.locals, Desc[Lang]);

$(function () {
    var html = isZH
        ? '<div class="top-tip">这个网站 (modelarjs.org) 是试运行的，仅支持 HTTPS 协议访问。如果访问遇到问题，请转向 <a href="https://hyurl.github.io/modelar">GitHub Pages</a>。</div>'
        : '<div class="top-tip">This website (modelarjs.org) is on trial operation stage, only supports HTTPS. If you\'ve got any problem, please redirect to <a href="https://hyurl.github.io/modelar">GitHub Pages</a>.</div>';
    if (location.pathname == "/" && this.location.hostname == "modelarjs.org") {
        $(".content").prepend(html);
    }
});

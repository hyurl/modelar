var sortBy = (pre, next) => {
    return parseInt(pre) - parseInt(next) > 0;
};

var getCategoryList = (req = {}) => {
    folders = fs.readdirSync("./articles/docs");
    categoryList = "";
    for (let folder of folders) {
        let category = folder.substring(3),
            link = "/docs/" + category.replace(/\s/g, "-"),
            path = folder.replace(/\s/g, "-"),
            _path = path.substring(3);
        active = req.params && req.params.name == _path ? 'active' : "";
        categoryList += '<li><a class="' + active + '" href="' + link + '">' +
            category + "</a></li>";
    }
    return categoryList;
};

router.get("/docs", (req, res) => {
    res.layoutView("docs/index", {
        categoryList: getCategoryList(),
    });
});

router.get("/docs/:name", (req, res) => {
    var folders = fs.readdirSync("./articles/docs"),
        categoryList = getCategoryList(req),
        category = req.params.name.replace(/-/g, " "),
        header = "#### Table of Contents",
        list = [],
        contents = [],
        id = getMarkdownAnchor(category);


    for (var folder of folders) {
        if (folder.indexOf(category) === 3) {
            folder = "./articles/docs/" + folder;
            break;
        }
    }
    var files = fs.readdirSync(folder),
        indexContent = fs.readFileSync(folder + "/index.md", "utf8");

    list.push("* [" + category + "](#" + id + ")");

    for (let file of files) {
        if (file != "index.md") {
            let title = file.substring(3, file.length - 3),
                id = getMarkdownAnchor(title),
                content = fs.readFileSync(folder + "/" + file, "utf8");
            list.push("    * [" + title + "](#" + id + ")");
            contents.push(content);
        }
    }

    list = list.join("\n");
    contents = contents.join("\n\n");

    MarkdownContents = `
${header}

${list}

${indexContent}

${contents}`;

    res.layoutView("docs/article", {
        categoryList,
        MarkdownContents,
    });
});
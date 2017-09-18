router.get("/advanced", (req, res) => {
    var folder = "./articles/advanced",
        files = fs.readdirSync(folder),
        indexContent = fs.readFileSync(folder + "/index.md", "utf8"),
        header = "#### Table of Contents",
        list = [],
        contents = [];

    for (let file of files) {
        if (file != "index.md") {
            let title = file.substring(3, file.length - 3),
                id = getMarkdownAnchor(title),
                content = fs.readFileSync(folder + "/" + file, "utf8");
            list.push("* [" + title + "](#" + id + ")");
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

    res.layoutView("advanced", {
        MarkdownContents,
    });
});
module.exports = (router) => {
    //Scan gets.
    var gets = fs.readdirSync(__dirname + "/gets");
    for (let file of gets) {
        require(__dirname + "/gets/" + file);
    }

    //Scan posts.
    var posts = fs.readdirSync(__dirname + "/posts");
    for (let file of posts) {
        require(__dirname + "/posts/" + file);
    }

    //If no route is defined for the current request, try to load view file 
    //automatically by its name.
    router.get("*", (req, res) => {
        var path = req.url.substring(1);
        if (fs.existsSync("./tpls/" + path + ".html")) {
            res.layoutView(path);
        } else {
            res.status(404);
            res.send("404 Not Found!");
        }
    });

    router.post("*", (req, res) => {
        res.status(404);
        res.send("404 Not Found!");
    });

    return router;
};
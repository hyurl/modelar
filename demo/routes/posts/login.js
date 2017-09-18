router.post("/login", (req, res) => {
    User.use(req.db).login({
        user: req.body.user,
        password: req.body.password,
    }).then(user => {
        //Save UID in session.
        req.session.UID = user.id;
        res.json({
            success: true,
            data: user.valueOf(),
        });
    }).catch(err => {
        res.json({
            success: false,
            msg: err.message,
        });
    });
});
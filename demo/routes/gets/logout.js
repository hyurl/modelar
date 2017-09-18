router.get("/logout", (req, res) => {
    delete req.session.UID;
    res.json({
        success: true,
        msg: "User logged out.",
    });
});
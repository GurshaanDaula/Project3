function requireLogin(req, res, next) {
    if (!req.session || !req.session.user) {
        return res.redirect("/login");
    }
    next();
}

function attachUserToLocals(req, res, next) {
    res.locals.currentUser = req.session.user || null;
    next();
}

module.exports = { requireLogin, attachUserToLocals };

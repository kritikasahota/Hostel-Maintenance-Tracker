
// Check whether the user is logged in
const isLoggedIn = (req, res, next) => {

    if (!req.session.userId) {
        return res.redirect("/login")
    }

    next()
}


// Check whether the logged-in user is a student
const isStudent = (req, res, next) => {

    if (!req.session.userId) {
        return res.redirect("/login")
    }

    if (req.session.role !== "student") {
        return res.status(403).send("Access denied")
    }

    next()
}

module.exports = {
    isLoggedIn,
    isStudent
}

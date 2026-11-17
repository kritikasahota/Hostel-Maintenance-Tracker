
const express = require("express")
const router = express.Router()

const User = require("../models/User")
const bcrypt = require("bcryptjs")

// ================= REGISTER =================

// Show registration page
router.get("/register", (req, res) => {
    res.render("users/register", { error: null })
})

// Handle registration form
router.post("/register", async (req, res) => {

    try {

        const { name, email, password } = req.body

        // Check empty fields
        if (!name || !email || !password) {
            return res.render("users/register", {
                error: "All fields are required"
            })
        }

        // Check password length
        if (password.length < 6) {
            return res.render("users/register", {
                error: "Password must contain at least 6 characters"
            })
        }

        // Check whether email already exists
        const existingUser = await User.findOne({ email })

        if (existingUser) {
            return res.render("users/register", {
                error: "Email is already registered"
            })
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12)

        // Create new student
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role: "student"
        })

        await newUser.save()

        // Redirect to login
        res.redirect("/login")

    } catch (err) {

        console.log(err)

        res.render("users/register", {
            error: "Something went wrong. Please try again."
        })
    }
})


// ================= LOGIN =================

// Show login page
router.get("/login", (req, res) => {
    res.render("users/login", { error: null })
})

// Handle login form
router.post("/login", async (req, res) => {

    try {

        const { email, password } = req.body

        // Find user
        const user = await User.findOne({ email })

        if (!user) {
            return res.render("users/login", {
                error: "Invalid email or password"
            })
        }

        // Compare entered password with hashed password
        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        )

        if (!isPasswordCorrect) {
            return res.render("users/login", {
                error: "Invalid email or password"
            })
        }

        // Create session
        req.session.userId = user._id.toString()
        req.session.role = user.role

        // Redirect according to role
        if (user.role === "admin") {
            return res.redirect("/admin/dashboard")
        }

        if (user.role === "staff") {
            return res.redirect("/staff/dashboard")
        }

        res.redirect("/student/dashboard")

    } catch (err) {

        console.log(err)

        res.render("users/login", {
            error: "Something went wrong. Please try again."
        })
    }
})


// ================= LOGOUT =================

// Handle logout
router.get("/logout", (req, res) => {

    req.session.destroy((err) => {

        if (err) {
            return res.status(500).send("Unable to logout")
        }

        // Clear session cookie
        res.clearCookie("connect.sid")

        // Redirect to homepage
        res.redirect("/")

    })
})


module.exports = router

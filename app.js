
const express = require("express")
const mongoose = require("mongoose")
const path = require("path")
const session = require("express-session")
const MongoStore = require("connect-mongo").default

require("dotenv").config()

const app = express()

// ================= MIDDLEWARE =================

// EJS configuration
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))

// Static files
app.use(express.static(path.join(__dirname, "public")))

// Read form data
app.use(express.urlencoded({ extended: true }))

// Session configuration
app.use(session({

    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URL,
        collectionName: "sessions"
    }),

    secret: process.env.SESSION_SECRET,

    resave: false,

    saveUninitialized: false,

    cookie: {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    }

}))

// Make logged-in user information available in all EJS pages
app.use((req, res, next) => {
    res.locals.currentUser = req.session.userId
        ? {
            id: req.session.userId,
            role: req.session.role
        }
        : null

    next()
})
// ================= ROUTES =================

// Home page
app.get("/", (req, res) => {
    res.render("home")
})

// Authentication routes
const userRoutes = require("./routes/user")

app.use("/", userRoutes)

const studentRoutes = require("./routes/student")

app.use("/student", studentRoutes)

// Admin routes
const adminRoutes = require("./routes/admin")

app.use("/admin", adminRoutes)

// Staff routes
const staffRoutes = require("./routes/staff")
app.use("/staff", staffRoutes)

// Complaint routes
const complaintRoutes = require("./routes/complaint")

app.use("/complaints", complaintRoutes)

// ================= DATABASE =================

main()
    .then(() => {

        console.log("Connected to MongoDB")

        app.listen(3000, () => {
            console.log("Server is running on port 3000")
        })

    })
    .catch((err) => {
        console.log("MongoDB connection error:", err)
    })

async function main() {
    await mongoose.connect(process.env.MONGO_URL)
}

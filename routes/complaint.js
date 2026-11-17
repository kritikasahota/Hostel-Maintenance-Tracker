
const express = require("express")
const router = express.Router()

const User = require("../models/User")
const Room = require("../models/Room")
const Complaint = require("../models/Complaint")

const { isStudent } = require("../middleware")


// ================= SHOW COMPLAINT FORM =================

router.get("/new", isStudent, async (req, res) => {

    try {

        // Find logged-in student and their assigned room
        const user = await User.findById(req.session.userId)
            .populate("room")

        if (!user) {
            return res.redirect("/login")
        }

        // A complaint must belong to a valid room
        if (!user.room) {
            return res.render("complaints/new", {
                error: "Your room has not been assigned yet. Please contact the hostel administrator.",
                formData: {}
            })
        }

        res.render("complaints/new", {
            error: null,
            formData: {}
        })

    } catch (err) {

        console.log("Complaint form error:", err)
        res.status(500).send("Unable to open complaint form")

    }

})


// ================= SUBMIT COMPLAINT =================

router.post("/", isStudent, async (req, res) => {

    try {

        const { title, category, description } = req.body

        const user = await User.findById(req.session.userId)
            .populate("room")

        if (!user) {
            return res.redirect("/login")
        }

        if (!user.room) {
            return res.render("complaints/new", {
                error: "Your room has not been assigned yet. Please contact the hostel administrator.",
                formData: req.body
            })
        }

        // Validate required fields
        if (!title || !category || !description) {
            return res.render("complaints/new", {
                error: "Please fill in all fields.",
                formData: req.body
            })
        }

        // Create complaint using the logged-in student's details
        const newComplaint = new Complaint({
            title: title.trim(),
            category,
            description: description.trim(),
            student: user._id,
            room: user.room._id
        })

        await newComplaint.save()

        // Return to dashboard after successful submission
        res.redirect("/student/dashboard?submitted=1")

    } catch (err) {

        console.log("Complaint submission error:", err)

        res.render("complaints/new", {
            error: "Unable to submit complaint. Please check your details and try again.",
            formData: req.body
        })

    }

})


// ================= VIEW COMPLAINT DETAILS =================

router.get("/:id", isStudent, async (req, res) => {
    try {
        // Find only the complaint submitted by the logged-in student
        const complaint = await Complaint.findOne({
            _id: req.params.id,
            student: req.session.userId
        })
            .populate("room", "roomNumber block")
            .populate("assignedTo", "name")

        if (!complaint) {
            return res.status(404).send("Complaint not found")
        }

        res.render("complaints/show", {
            complaint
        })

    } catch (err) {
        console.log("Complaint details error:", err)
        res.status(500).send("Unable to load complaint details")
    }
})

module.exports = router

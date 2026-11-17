
const express = require("express")
const router = express.Router()
const Room = require("../models/Room")
const User = require("../models/User")
const Complaint = require("../models/Complaint")

const { isStudent } = require("../middleware")


// ================= STUDENT DASHBOARD =================

router.get("/dashboard", isStudent, async (req, res) => {

    try {

        // Find the currently logged-in student
        const user = await User.findById(req.session.userId)
            .populate("room")

        // If user no longer exists, return to login
        if (!user) {
            req.session.destroy(() => {
                res.redirect("/login")
            })
            return
        }

        // Find complaints submitted by this student
        const complaints = await Complaint.find({
            student: req.session.userId
        }).sort({ createdAt: -1 })

        // Calculate complaint statistics
        const totalComplaints = complaints.length

        const pendingComplaints = complaints.filter(complaint =>
            ["Pending", "Assigned", "In Progress"].includes(complaint.status)
        ).length

        const resolvedComplaints = complaints.filter(complaint =>
            complaint.status === "Resolved"
        ).length

        // Send data to EJS dashboard
        res.render("student/dashboard", {
            user,
            complaints,
            totalComplaints,
            pendingComplaints,
            resolvedComplaints,
            success: req.query.submitted === "1"
        })

    } catch (err) {

        console.log("Dashboard error:", err)

        res.status(500).send("Unable to load dashboard")
    }

})

module.exports = router

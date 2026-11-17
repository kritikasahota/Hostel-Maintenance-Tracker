
const express = require("express")
const router = express.Router()

const Complaint = require("../models/Complaint")
const { isLoggedIn } = require("../middleware")

// Staff-only middleware
const isStaff = (req, res, next) => {
    if (req.session.role !== "staff") {
        return res.status(403).send("Access denied")
    }

    next()
}


// ================= STAFF DASHBOARD =================

router.get("/dashboard", isLoggedIn, isStaff, async (req, res) => {
    try {
        // Find only complaints assigned to the logged-in staff member
        const complaints = await Complaint.find({
            assignedTo: req.session.userId
        })
            .populate("student", "name email")
            .populate("room", "roomNumber block")
            .sort({ createdAt: -1 })

        res.render("staff/dashboard", {
            complaints
        })

    } catch (err) {
        console.log("Staff dashboard error:", err)
        res.status(500).send("Unable to load staff dashboard")
    }
})


// ================= UPDATE ASSIGNED COMPLAINT =================

router.post("/complaints/:id/status", isLoggedIn, isStaff, async (req, res) => {
    try {
        const { status, resolutionNote } = req.body

        // Staff can only use these two statuses
        if (!["In Progress", "Resolved"].includes(status)) {
            return res.status(400).send("Invalid complaint status")
        }

        // Update only if this complaint belongs to the logged-in staff member
        const complaint = await Complaint.findOne({
            _id: req.params.id,
            assignedTo: req.session.userId
        })

        if (!complaint) {
            return res.status(404).send("Assigned complaint not found")
        }

        complaint.status = status

        if (status === "Resolved") {
            complaint.resolutionNote = resolutionNote
                ? resolutionNote.trim()
                : ""
        }

        await complaint.save()

        res.redirect("/staff/dashboard")

    } catch (err) {
        console.log("Staff complaint update error:", err)
        res.status(500).send("Unable to update complaint")
    }
})


module.exports = router

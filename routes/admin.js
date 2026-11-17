
const express = require("express")
const router = express.Router()

const Room = require("../models/Room")
const User = require("../models/User")
const Complaint = require("../models/Complaint")

const { isLoggedIn } = require("../middleware")

// Admin-only middleware
const isAdmin = (req, res, next) => {
    if (req.session.role !== "admin") {
        return res.status(403).send("Access denied")
    }

    next()
}

// Allowed complaint statuses
const complaintStatuses = [
    "Pending",
    "Assigned",
    "In Progress",
    "Resolved",
    "Rejected"
]


// ================= ADMIN DASHBOARD =================

router.get("/dashboard", isLoggedIn, isAdmin, async (req, res) => {
    try {
        const rooms = await Room.find()
            .sort({ block: 1, roomNumber: 1 })

        const students = await User.find({ role: "student" })
            .populate("room")

        res.render("admin/dashboard", {
            rooms,
            students,
            error: null,
            success: null
        })

    } catch (err) {
        console.log("Admin dashboard error:", err)
        res.status(500).send("Unable to load admin dashboard")
    }
})


// ================= CREATE ROOM =================

router.post("/rooms", isLoggedIn, isAdmin, async (req, res) => {
    try {
        const { roomNumber, block, floor, capacity } = req.body

        await Room.create({
            roomNumber,
            block,
            floor,
            capacity
        })

        res.redirect("/admin/dashboard")

    } catch (err) {
        console.log("Room creation error:", err)
        res.status(400).send(
            "Unable to create room. Check the details or duplicate room number."
        )
    }
})


// ================= ASSIGN ROOM =================

router.post("/assign-room", isLoggedIn, isAdmin, async (req, res) => {
    try {
        const { studentId, roomId } = req.body

        const student = await User.findOne({
            _id: studentId,
            role: "student"
        })

        const room = await Room.findById(roomId)

        if (!student || !room) {
            return res.status(404).send("Student or room not found")
        }

        // Count students currently assigned to this room
        const occupiedCount = await User.countDocuments({
            room: room._id
        })

        // Check room capacity
        if (occupiedCount >= room.capacity) {
            return res.status(400).send("This room is already full")
        }

        // Assign room to student
        student.room = room._id

        await student.save()

        res.redirect("/admin/dashboard")

    } catch (err) {
        console.log("Room assignment error:", err)
        res.status(500).send("Unable to assign room")
    }
})


// ================= VIEW ALL COMPLAINTS =================

router.get("/complaints", isLoggedIn, isAdmin, async (req, res) => {
    try {
        const complaints = await Complaint.find()
            .populate("student", "name email")
            .populate("room", "roomNumber block")
            .populate("assignedTo", "name")
            .sort({ createdAt: -1 })

        // Fetch all maintenance staff for the assignment dropdown
        const staffMembers = await User.find({ role: "staff" })
            .select("name email")

        res.render("admin/complaints", {
            complaints,
            complaintStatuses,
            staffMembers
        })

    } catch (err) {
        console.log("Admin complaints error:", err)
        res.status(500).send("Unable to load complaints")
    }
})


// ================= UPDATE COMPLAINT STATUS =================

router.post("/complaints/:id/status", isLoggedIn, isAdmin, async (req, res) => {
    try {
        const { status } = req.body

        // Validate selected status
        if (!complaintStatuses.includes(status)) {
            return res.status(400).send("Invalid complaint status")
        }

        // Find complaint and update status
        const complaint = await Complaint.findByIdAndUpdate(
            req.params.id,
            { status },
            {
                new: true,
                runValidators: true
            }
        )

        if (!complaint) {
            return res.status(404).send("Complaint not found")
        }

        res.redirect("/admin/complaints")

    } catch (err) {
        console.log("Complaint status update error:", err)
        res.status(500).send("Unable to update complaint status")
    }
})


// ================= ASSIGN STAFF TO COMPLAINT =================

router.post("/complaints/:id/assign-staff", isLoggedIn, isAdmin, async (req, res) => {
    try {
        const { staffId } = req.body

        // Find the selected staff account
        const staff = await User.findOne({
            _id: staffId,
            role: "staff"
        })

        if (!staff) {
            return res.status(404).send("Staff member not found")
        }

        // Find the complaint
        const complaint = await Complaint.findById(req.params.id)

        if (!complaint) {
            return res.status(404).send("Complaint not found")
        }

        // Do not assign closed complaints
        if (["Resolved", "Rejected"].includes(complaint.status)) {
            return res.status(400).send("Cannot assign a closed complaint")
        }

        // Assign complaint to selected staff member
        complaint.assignedTo = staff._id
        complaint.status = "Assigned"

        await complaint.save()

        res.redirect("/admin/complaints")

    } catch (err) {
        console.log("Staff assignment error:", err)
        res.status(500).send("Unable to assign staff")
    }
})


module.exports = router

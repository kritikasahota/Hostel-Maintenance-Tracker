
const mongoose = require("mongoose")

const complaintSchema = new mongoose.Schema({

    // Complaint title
    title: {
        type: String,
        required: true,
        trim: true
    },

    // Type of maintenance issue
    category: {
        type: String,
        enum: [
            "Electrical",
            "Plumbing",
            "Furniture",
            "Cleaning",
            "Internet",
            "Other"
        ],
        required: true
    },

    // Detailed complaint
    description: {
        type: String,
        required: true
    },

    // Student who submitted complaint
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    // Room where the issue occurred
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room",
        required: true
    },

    // Staff member assigned to resolve it
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },

    // Current complaint status
    status: {
        type: String,
        enum: [
            "Pending",
            "Assigned",
            "In Progress",
            "Resolved",
            "Rejected"
        ],
        default: "Pending"
    },

    // Uploaded complaint images
    images: [{
        url: String,
        filename: String
    }],

    // Resolution details
    resolutionNote: {
        type: String,
        default: ""
    }

}, { timestamps: true })

const Complaint = mongoose.model("Complaint", complaintSchema)

module.exports = Complaint

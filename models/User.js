
const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({

    // User's full name
    name: {
        type: String,
        required: true,
        trim: true
    },

    // Email must be unique
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    // Password will be hashed before saving
    password: {
        type: String,
        required: true
    },

    // Different roles in our application
    role: {
        type: String,
        enum: ["student", "admin", "staff"],
        default: "student"
    },

    // Room assigned to the student
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room",
        default: null
    }

}, { timestamps: true })

const User = mongoose.model("User", userSchema)

module.exports = User

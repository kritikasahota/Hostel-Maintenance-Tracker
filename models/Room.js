
const mongoose = require("mongoose")

const roomSchema = new mongoose.Schema({

    // Room number
    roomNumber: {
        type: String,
        required: true,
        trim: true
    },

    // Hostel block
    block: {
        type: String,
        required: true
    },

    // Floor number
    floor: {
        type: Number,
        required: true
    },

    // Maximum students allowed
    capacity: {
        type: Number,
        required: true,
        min: 1
    }

}, { timestamps: true })

// A room number should be unique within its block
roomSchema.index({ roomNumber: 1, block: 1 }, { unique: true })

const Room = mongoose.model("Room", roomSchema)

module.exports = Room

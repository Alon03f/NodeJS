const mongoose = require("mongoose");

const failedLoginSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    count: { type: Number, default: 0 },
    lastAttempt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("FailedLogin", failedLoginSchema);

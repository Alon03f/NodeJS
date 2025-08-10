const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            first: { type: String, required: true, minlength: 2 },
            middle: { type: String, default: "" },
            last: { type: String, required: true, minlength: 2 },
        },
        phone: {
            type: String,
            required: true,
            minlength: 9,
            maxlength: 15,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            match: /^\S+@\S+\.\S+$/,
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
        },
        image: {
            url: {
                type: String,
                default: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
            },
            alt: {
                type: String,
                default: "user image",
            },
        },
        address: {
            state: { type: String, default: "not defined" },
            country: { type: String, required: true },
            city: { type: String, required: true },
            street: { type: String, required: true },
            houseNumber: { type: Number, required: true },
            zip: { type: Number, default: 0 },
        },
        isBusiness: {
            type: Boolean,
            default: false,
        },
        isAdmin: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
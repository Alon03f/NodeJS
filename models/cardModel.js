const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            minlength: 2,
        },
        subtitle: {
            type: String,
            required: true,
            minlength: 2,
        },
        description: {
            type: String,
            required: true,
            minlength: 10,
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
            match: /^\S+@\S+\.\S+$/,
        },
        web: {
            type: String,
            default: "",
        },
        image: {
            url: {
                type: String,
                default: "https://cdn.pixabay.com/photo/2016/04/01/10/11/avatar-1299895_960_720.png",
            },
            alt: {
                type: String,
                default: "business card image",
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
        bizNumber: {
            type: Number,
            required: true,
            unique: true,
        },
        likes: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: "User",
            default: [],
        },
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

const Card = mongoose.model("Card", cardSchema);

module.exports = Card;
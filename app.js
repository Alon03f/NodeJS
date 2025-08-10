require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const connectDB = require("./config/db");

const userRoutes = require("./routes/userRoutes");
const cardRoutes = require("./routes/cardRoutes");

const app = express();

connectDB();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan("dev"));

app.use(express.static(path.join(__dirname, "public")));

app.use("/api/users", userRoutes);
app.use("/api/cards", cardRoutes);

const errorHandler = require("./middleware/errorHandler");
app.use(errorHandler);

app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

module.exports = app;
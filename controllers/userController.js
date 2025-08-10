const User = require("../models/userModel");
const FailedLogin = require("../models/failedLoginModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validateUser } = require("../validators/userValidation");

const registerUser = async (req, res) => {
    try {
        console.log("Register request body:", req.body);

        const { error } = validateUser(req.body);
        if (error) {
            console.log("Validation error:", error.details[0].message);
            return res.status(400).json({ message: error.details[0].message });
        }

        const { email, password, ...rest } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            ...rest,
            email,
            password: hashedPassword,
        });

        await newUser.save();

        console.log("User registered successfully:", newUser.email);

        res.status(201).json({
            message: "User registered successfully",
            id: newUser._id,
        });
    } catch (err) {
        console.error("Register Error Full:", err);
        if (err.code === 11000) {
            return res.status(400).json({ message: "Email already exists" });
        }
        res.status(500).json({ message: "Server error during registration" });
    }
};

const loginUser = async (req, res) => {
    try {
        console.log("=== LOGIN ATTEMPT ===");
        console.log("Login request body:", req.body);

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const failed = await FailedLogin.findOne({ email });
        const now = new Date();

        if (failed && failed.count >= 3) {
            const timeSinceLastAttempt = now - failed.lastAttempt;
            const blockDuration = 60000;

            if (timeSinceLastAttempt < blockDuration) {
                const remainingTime = Math.ceil((blockDuration - timeSinceLastAttempt) / 1000);
                console.log(`❌ User ${email} is blocked for ${remainingTime} more seconds`);

                return res.status(403).json({
                    message: `המשתמש נחסם למשך ${remainingTime} שניות`,
                    remainingTime: remainingTime,
                    blocked: true
                });
            } else {
                console.log(`Block period expired for ${email}, resetting attempts`);
                await FailedLogin.deleteOne({ email });
            }
        }

        const user = await User.findOne({ email });
        if (!user) {
            console.log(`❌ User not found: ${email}`);
            await recordFailedLogin(email, now);
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log(`❌ Invalid password for: ${email}`);
            await recordFailedLogin(email, now);
            return res.status(401).json({ message: "Invalid email or password" });
        }

        console.log(`✅ Successful login for: ${email}`);
        await FailedLogin.deleteOne({ email });

        const payload = {
            id: user._id,
            isBusiness: user.isBusiness,
            isAdmin: user.isAdmin,
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "1d",
        });

        console.log("Login successful for:", user.email);
        res.json({ token });
    } catch (err) {
        console.error("❌ Login Error:", err);
        res.status(500).json({ message: "Server error during login" });
    }
};

async function recordFailedLogin(email, now) {
    try {
        const failed = await FailedLogin.findOne({ email });

        if (failed) {
            failed.count += 1;
            failed.lastAttempt = now;
            await failed.save();
            console.log(`🔴 Failed login attempt ${failed.count} for: ${email}`);
        } else {
            await FailedLogin.create({ email, count: 1, lastAttempt: now });
            console.log(`🔴 First failed login attempt for: ${email}`);
        }

        const updatedFailed = await FailedLogin.findOne({ email });
        if (updatedFailed && updatedFailed.count >= 3) {
            console.log(`🚫 User ${email} will be blocked for 60 seconds after ${updatedFailed.count} failed attempts`);
        }
    } catch (error) {
        console.error("Error recording failed login:", error);
    }
}

module.exports = {
    registerUser,
    loginUser,
};
const Card = require("../models/cardModel");
const { validateCard } = require("../validators/cardValidation");

const getAllCards = async (req, res) => {
    try {
        const cards = await Card.find().populate('user_id', 'name email');
        res.status(200).json(cards);
    } catch (err) {
        console.error("Error fetching cards:", err.message);
        res.status(500).json({ message: "Server error while fetching cards" });
    }
};

const createCard = async (req, res) => {
    try {
        console.log("=== CREATE CARD DEBUG ===");
        console.log("Request body:", JSON.stringify(req.body, null, 2));
        console.log("User from token:", req.user);

        const user = req.user;

        if (!user) {
            console.log("No user found in request");
            return res.status(401).json({ message: "Authentication required" });
        }

        if (!user.isBusiness) {
            console.log("User is not business:", user);
            return res.status(403).json({ message: "Access denied. Only business users can create cards." });
        }

        console.log("User is business, proceeding with validation");

        let cleanData = {
            title: req.body.title?.trim(),
            subtitle: req.body.subtitle?.trim(),
            description: req.body.description?.trim(),
            phone: req.body.phone?.trim(),
            email: req.body.email?.trim(),
            web: req.body.web?.trim() || "",
            image: req.body.image?.trim() || "",
            address: {
                state: req.body.address?.state?.trim() || "",
                country: req.body.address?.country?.trim(),
                city: req.body.address?.city?.trim(),
                street: req.body.address?.street?.trim(),
                houseNumber: parseInt(req.body.address?.houseNumber) || 1,
                zip: parseInt(req.body.address?.zip) || 0
            }
        };

        console.log("Cleaned data:", JSON.stringify(cleanData, null, 2));

        const { error, value } = validateCard(cleanData);
        if (error) {
            console.log("❌ Validation error:", error.details);
            return res.status(400).json({
                message: "Validation error: " + error.details.map(d => d.message).join(", "),
                details: error.details
            });
        }

        console.log("Validation passed, validated data:", JSON.stringify(value, null, 2));

        const generateUniqueBizNumber = async () => {
            let exists = true;
            let bizNumber;
            let attempts = 0;

            while (exists && attempts < 10) {
                bizNumber = Math.floor(100000 + Math.random() * 900000);
                const existing = await Card.findOne({ bizNumber });
                if (!existing) exists = false;
                attempts++;
            }

            if (attempts >= 10) {
                throw new Error("Could not generate unique business number");
            }

            return bizNumber;
        };

        const bizNumber = await generateUniqueBizNumber();
        console.log("Generated bizNumber:", bizNumber);

        const cardData = {
            ...value,
            bizNumber,
            user_id: user.id,
        };

        console.log("Final card data for saving:", JSON.stringify(cardData, null, 2));

        const newCard = new Card(cardData);
        const savedCard = await newCard.save();

        console.log("Card saved successfully:", savedCard._id);
        res.status(201).json(savedCard);

    } catch (err) {
        console.error("CREATE CARD ERROR:");
        console.error("Error message:", err.message);
        console.error("Error stack:", err.stack);

        if (err.name === 'ValidationError') {
            console.log("Mongoose validation error details:", err.errors);
            return res.status(400).json({
                message: "Database validation error",
                details: Object.keys(err.errors).map(key => ({
                    field: key,
                    message: err.errors[key].message
                }))
            });
        }

        res.status(500).json({
            message: "Server error while creating card",
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

const getMyCards = async (req, res) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }

        const cards = await Card.find({ user_id: user.id });
        res.status(200).json(cards);
    } catch (err) {
        console.error("Error fetching user cards:", err.message);
        res.status(500).json({ message: "Server error while fetching your cards" });
    }
};

const getFavoriteCards = async (req, res) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }

        const cards = await Card.find({ likes: user.id }).populate('user_id', 'name email');
        res.status(200).json(cards);
    } catch (err) {
        console.error("Error fetching favorite cards:", err.message);
        res.status(500).json({ message: "Server error while fetching favorite cards" });
    }
};

const deleteCard = async (req, res) => {
    try {
        const user = req.user;
        const cardId = req.params.id;

        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }

        const card = await Card.findById(cardId);
        if (!card) {
            return res.status(404).json({ message: "Card not found" });
        }

        if (card.user_id.toString() !== user.id && !user.isAdmin) {
            return res.status(403).json({ message: "Access denied" });
        }

        await Card.findByIdAndDelete(cardId);
        res.status(200).json({ message: "Card deleted successfully" });
    } catch (err) {
        console.error("Error deleting card:", err.message);
        res.status(500).json({ message: "Server error while deleting card" });
    }
};

const likeCard = async (req, res) => {
    try {
        const user = req.user;
        const cardId = req.params.id;

        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }

        const card = await Card.findById(cardId);
        if (!card) {
            return res.status(404).json({ message: "Card not found" });
        }

        const userIndex = card.likes.indexOf(user.id);

        if (userIndex === -1) {
            card.likes.push(user.id);
        } else {
            card.likes.splice(userIndex, 1);
        }

        await card.save();
        res.status(200).json(card);
    } catch (err) {
        console.error("Error liking card:", err.message);
        res.status(500).json({ message: "Server error while liking card" });
    }
};

module.exports = {
    getAllCards,
    createCard,
    getMyCards,
    getFavoriteCards,
    deleteCard,
    likeCard,
};
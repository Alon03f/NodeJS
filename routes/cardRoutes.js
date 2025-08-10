const express = require("express");
const router = express.Router();

const {
    getAllCards,
    createCard,
    getMyCards,
    getFavoriteCards,
    deleteCard,
    likeCard
} = require("../controllers/cardController");
const auth = require("../middleware/authMiddleware");

router.get("/", getAllCards);

router.post("/", auth, createCard);
router.get("/my-cards", auth, getMyCards);
router.get("/favorites", auth, getFavoriteCards);
router.delete("/:id", auth, deleteCard);
router.patch("/:id/like", auth, likeCard);

module.exports = router;
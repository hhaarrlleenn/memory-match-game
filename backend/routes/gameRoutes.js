const express = require("express");

const router = express.Router();

const {
  createGame,
  getGames,
  getGameById,
  deleteGame,
  getGameStats,
  getLeaderboard
} = require("../controllers/gameController");

const validateGame = require("../middleware/validationMiddleware");

// ==========================================
// GAME ROUTES
// ==========================================

// Create a game result
router.post("/games", validateGame, createGame);

// Get all game results
router.get("/games", getGames);

// Get game statistics
router.get("/games/stats", getGameStats);

// Get leaderboard
router.get("/games/leaderboard", getLeaderboard);

// Get one game result
// IMPORTANT: Keep this AFTER /stats and /leaderboard
router.get("/games/:id", getGameById);

// Delete a game result
router.delete("/games/:id", deleteGame);

module.exports = router;
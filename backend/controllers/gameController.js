const Game = require("../models/gameModel");

// Create a game result
const createGame = async (req, res, next) => {
  try {
    const { level, moves, time, won } = req.body;

    const game = await Game.createGame({
      level,
      moves,
      time,
      won
    });

    res.status(201).json({
      success: true,
      message: "Game result saved successfully",
      data: game
    });
  } catch (error) {
    next(error);
  }
};

// Get all game results
const getGames = async (req, res, next) => {
  try {
    const games = await Game.getAllGames();

    res.status(200).json({
      success: true,
      count: games.length,
      data: games
    });
  } catch (error) {
    next(error);
  }
};

// Get one game result
const getGameById = async (req, res, next) => {
  try {
    const game = await Game.getGameById(req.params.id);

    if (!game) {
      return res.status(404).json({
        success: false,
        message: "Game result not found"
      });
    }

    res.status(200).json({
      success: true,
      data: game
    });
  } catch (error) {
    next(error);
  }
};

// Delete a game result
const deleteGame = async (req, res, next) => {
  try {
    const result = await Game.deleteGame(req.params.id);

    if (!result || result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: "Game result not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Game result deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};

// Get game statistics
const getGameStats = async (req, res, next) => {
  try {
    const stats = await Game.getGameStats();

    const totalGames = stats.totalGames || 0;
    const wins = stats.wins || 0;
    const losses = stats.losses || 0;

    const winRate =
      totalGames > 0
        ? Number(((wins / totalGames) * 100).toFixed(2))
        : 0;

    res.status(200).json({
      success: true,
      data: {
        totalGames,
        wins,
        losses,
        winRate,
        bestMoves: stats.bestMoves,
        bestTime: stats.bestTime
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get leaderboard
const getLeaderboard = async (req, res, next) => {
  try {
    const { level } = req.query;

    // Validate level if provided
    if (level && !["E", "M", "H"].includes(level)) {
      return res.status(400).json({
        success: false,
        message: "Level must be E, M or H"
      });
    }

    const leaderboard = await Game.getLeaderboard(level);

    res.status(200).json({
      success: true,
      count: leaderboard.length,
      data: leaderboard
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createGame,
  getGames,
  getGameById,
  deleteGame,
  getGameStats,
  getLeaderboard
};
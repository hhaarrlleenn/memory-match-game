const { getDatabase } = require("../config/database");

// Create a game result
const createGame = (gameData) => {
  const db = getDatabase();

  const statement = db.prepare(`
    INSERT INTO games (level, moves, time, won)
    VALUES (?, ?, ?, ?)
  `);

  const result = statement.run(
    gameData.level,
    gameData.moves,
    gameData.time,
    gameData.won ? 1 : 0
  );

  return db
    .prepare(`
      SELECT * FROM games WHERE id = ?
    `)
    .get(result.lastInsertRowid);
};

// Get all game results
const getAllGames = () => {
  const db = getDatabase();

  return db
    .prepare(`
      SELECT * FROM games
      ORDER BY createdAt DESC
    `)
    .all();
};

// Get one game result
const getGameById = (id) => {
  const db = getDatabase();

  return db
    .prepare(`
      SELECT * FROM games WHERE id = ?
    `)
    .get(id);
};

// Delete a game result
const deleteGame = (id) => {
  const db = getDatabase();

  return db
    .prepare(`
      DELETE FROM games WHERE id = ?
    `)
    .run(id);
};

// Get game statistics
const getGameStats = () => {
  const db = getDatabase();

  return db
    .prepare(`
      SELECT
        COUNT(*) AS totalGames,
        SUM(CASE WHEN won = 1 THEN 1 ELSE 0 END) AS wins,
        SUM(CASE WHEN won = 0 THEN 1 ELSE 0 END) AS losses,
        MIN(CASE WHEN won = 1 THEN moves END) AS bestMoves,
        MIN(CASE WHEN won = 1 THEN time END) AS bestTime
      FROM games
    `)
    .get();
};

// Get leaderboard
const getLeaderboard = (level) => {
  const db = getDatabase();

  // Leaderboard for a specific level
  if (level) {
    return db
      .prepare(`
        SELECT
          id,
          level,
          moves,
          time,
          won,
          createdAt
        FROM games
        WHERE level = ? AND won = 1
        ORDER BY moves ASC, time ASC
        LIMIT 10
      `)
      .all(level);
  }

  // Leaderboard for all levels
  return db
    .prepare(`
      SELECT
        id,
        level,
        moves,
        time,
        won,
        createdAt
      FROM games
      WHERE won = 1
      ORDER BY moves ASC, time ASC
      LIMIT 10
    `)
    .all();
};

module.exports = {
  createGame,
  getAllGames,
  getGameById,
  deleteGame,
  getGameStats,
  getLeaderboard
};
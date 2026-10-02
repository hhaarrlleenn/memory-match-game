const validateGame = (req, res, next) => {
  const { level, moves, time, won } = req.body;

  if (!level || moves === undefined || time === undefined || won === undefined) {
    return res.status(400).json({
      success: false,
      message: "level, moves, time and won are required"
    });
  }

  if (!["E", "M", "H"].includes(level)) {
    return res.status(400).json({
      success: false,
      message: "Level must be E, M or H"
    });
  }

  if (typeof moves !== "number" || moves < 1) {
    return res.status(400).json({
      success: false,
      message: "Moves must be a positive number"
    });
  }

  if (typeof time !== "number" || time < 0) {
    return res.status(400).json({
      success: false,
      message: "Time must be a non-negative number"
    });
  }

  if (typeof won !== "boolean") {
    return res.status(400).json({
      success: false,
      message: "Won must be true or false"
    });
  }

  next();
};

module.exports = validateGame;
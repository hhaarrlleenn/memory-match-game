# Memory Match Game

## Description

Memory Match Game is a card matching game built using React, Node.js, Express and SQLite. It has three difficulty levels with different grid sizes, move limits and time limits. Game results are stored in a SQLite database through a REST API.

## Project Structure

```text
memory-game/
│
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   └── gameController.js
│   ├── middleware/
│   │   ├── errorMiddleware.js
│   │   └── validationMiddleware.js
│   ├── models/
│   │   └── gameModel.js
│   ├── routes/
│   │   └── gameRoutes.js
│   ├── server.js
│   └── package.json
│
├── src/
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
│
├── public/
│
├── package.json
├── .gitignore
└── README.md
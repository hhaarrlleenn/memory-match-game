import { useEffect, useMemo, useState } from "react";

const symbols = [

  "🍎",

  "🍌",

  "🍇",

  "🍉",

  "🍓",

  "🍒",

  "🥝",

  "🍍",

  "🥭",

  "🍑",

  "🍊",

  "🍋",

  "🥥",

  "🍐",

  "🍈",

  "🫐",

  "🐶",

  "🐱",

  "🐭",

  "🐹",

  "🐰",

  "🦊",

  "🐻",

  "🐼",

  "🐨",

  "🐯",

  "🦁",

  "🐮",

  "🐷",

  "🐸",

  "🐵",

  "🐙"

];

function shuffle(array) {

  return [...array].sort(() => Math.random() - 0.5);

}

function App() {

  // -------------------------

  // LEVEL

  // -------------------------

  const [level, setLevel] = useState("E");

  // -------------------------

  // GAME STATE

  // -------------------------

  const [flippedCards, setFlippedCards] = useState([]);

  const [matchedCards, setMatchedCards] = useState([]);

  const [moves, setMoves] = useState(0);

  const [time, setTime] = useState(0);

  const [gameStarted, setGameStarted] = useState(false);

  const [gameWon, setGameWon] = useState(false);

  const [gameLost, setGameLost] = useState(false);

  const [gameId, setGameId] = useState(0);

  // Prevent duplicate API requests

  const [resultSaved, setResultSaved] = useState(false);

  // -------------------------

  // BACKEND STATS

  // -------------------------

  const [backendStats, setBackendStats] = useState(null);

  const [leaderboard, setLeaderboard] = useState([]);

  const [backendLoading, setBackendLoading] = useState(false);

  const [backendError, setBackendError] = useState("");

  // -------------------------

  // LEVEL SETTINGS

  // -------------------------

  const levelSettings = {

    E: {

      size: 2,

      maxMoves: 6,

      maxTime: 30

    },

    M: {

      size: 4,

      maxMoves: 30,

      maxTime: 90

    },

    H: {

      size: 8,

      maxMoves: 100,

      maxTime: 180

    }

  };

  const settings = levelSettings[level];

  const size = settings.size;

  const totalCards = size * size;

  const pairs = totalCards / 2;

  const maxMoves = settings.maxMoves;

  const maxTime = settings.maxTime;

  const cardsLeft = totalCards - matchedCards.length;

  // -------------------------

  // BACKEND DATA

  // -------------------------

  const fetchBackendData = async () => {

    setBackendLoading(true);

    setBackendError("");

    try {

      const [statsResponse, leaderboardResponse] = await Promise.all([

        fetch("http://localhost:5001/api/games/stats"),

        fetch(`http://localhost:5001/api/games/leaderboard?level=${level}`)

      ]);

      const statsData = await statsResponse.json();

      const leaderboardData = await leaderboardResponse.json();

      if (!statsResponse.ok) {

        throw new Error(

          statsData.message || "Failed to load game statistics"

        );

      }

      if (!leaderboardResponse.ok) {

        throw new Error(

          leaderboardData.message || "Failed to load leaderboard"

        );

      }

      setBackendStats(statsData.data);

      setLeaderboard(leaderboardData.data);

    } catch (error) {

      console.error("Failed to load backend data:", error);

      setBackendError(

        "Could not load server statistics. Make sure the backend is running."

      );

    } finally {

      setBackendLoading(false);

    }

  };

  useEffect(() => {

    fetchBackendData();

  }, [level]);

  // -------------------------

  // SAVE GAME RESULT

  // -------------------------

  const saveGameResult = async (

    won,

    finalMoves = moves,

    finalTime = time

  ) => {

    if (resultSaved) {

      return;

    }

    setResultSaved(true);

    try {

      const response = await fetch("http\\://localhost:5001/api/games", {

        method: "POST",

        headers: {

          "Content-Type": "application/json"

        },

        body: JSON.stringify({

          level,

          moves: finalMoves,

          time: finalTime,

          won

        })

      });

      const data = await response.json();

      if (!response.ok) {

        throw new Error(data.message || "Failed to save game result");

      }

      console.log("Game result saved:", data);

      fetchBackendData();

    } catch (error) {

      console.error("Failed to save game result:", error);

      // Allow another attempt if the request itself failed

      setResultSaved(false);

    }

  };

  // -------------------------

  // GENERATE CARDS

  // -------------------------

  const cards = useMemo(() => {

    // Randomly select different symbols for every new game

    const selectedSymbols = shuffle(symbols).slice(0, pairs);

    // Create pairs

    const cardValues = shuffle([

      ...selectedSymbols,

      ...selectedSymbols

    ]);

    return cardValues.map((value, index) => ({

      id: index,

      value: value

    }));

  }, [level, pairs, gameId]);

  // -------------------------

  // TIMER

  // -------------------------

  useEffect(() => {

    if (!gameStarted || gameWon || gameLost) {

      return;

    }

    const timer = setInterval(() => {

      setTime((previousTime) => {

        if (previousTime >= maxTime - 1) {

          clearInterval(timer);

          setGameLost(true);

          saveGameResult(false, moves, maxTime);

          setFlippedCards([]);

          return maxTime;

        }

        return previousTime + 1;

      });

    }, 1000);

    return () => {

      clearInterval(timer);

    };

  }, [gameStarted, gameWon, gameLost, maxTime]);

  // -------------------------

  // FORMAT TIME

  // -------------------------

  const formatTime = (seconds) => {

    const minutes = Math.floor(seconds / 60);

    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(

      remainingSeconds

    ).padStart(2, "0")}`;

  };

  // -------------------------

  // CARD CLICK

  // -------------------------

  const handleCardClick = (id) => {

    if (gameWon || gameLost) {

      return;

    }

    if (flippedCards.includes(id)) {

      return;

    }

    if (matchedCards.includes(id)) {

      return;

    }

    if (flippedCards.length === 2) {

      return;

    }

    // Start timer on first card

    if (!gameStarted) {

      setGameStarted(true);

    }

    const newFlippedCards = [...flippedCards, id];

    setFlippedCards(newFlippedCards);

    // Compare after second card

    if (newFlippedCards.length === 2) {

      const newMoves = moves + 1;

      setMoves(newMoves);

      // Move limit reached

      if (newMoves >= maxMoves) {

        const firstCard = cards.find(

          (card) => card.id === newFlippedCards[0]

        );

        const secondCard = cards.find(

          (card) => card.id === newFlippedCards[1]

        );

        // Allow final move if it is a match

        if (firstCard.value === secondCard.value) {

          const newMatchedCards = [

            ...matchedCards,

            firstCard.id,

            secondCard.id

          ];

          setMatchedCards(newMatchedCards);

          setFlippedCards([]);

          if (newMatchedCards.length === totalCards) {

            setGameWon(true);

            saveGameResult(true, newMoves, time);

          } else {

            setGameLost(true);

            saveGameResult(false, newMoves, time);

          }

        } else {

          setTimeout(() => {

            setFlippedCards([]);

            setGameLost(true);

            saveGameResult(false, newMoves, time);

          }, 1000);

        }

        return;

      }

      const firstCard = cards.find(

        (card) => card.id === newFlippedCards[0]

      );

      const secondCard = cards.find(

        (card) => card.id === newFlippedCards[1]

      );

      // -------------------------

      // MATCH

      // -------------------------

      if (firstCard.value === secondCard.value) {

        const newMatchedCards = [

          ...matchedCards,

          firstCard.id,

          secondCard.id

        ];

        setMatchedCards(newMatchedCards);

        setFlippedCards([]);

        // WIN

        if (newMatchedCards.length === totalCards) {

          setGameWon(true);

          saveGameResult(true, newMoves, time);

        }

      }

      // -------------------------

      // NOT A MATCH

      // -------------------------

      else {

        setTimeout(() => {

          setFlippedCards([]);

        }, 1000);

      }

    }

  };

  // -------------------------

  // RESTART

  // -------------------------

  const restartGame = () => {

    setFlippedCards([]);

    setMatchedCards([]);

    setMoves(0);

    setTime(0);

    setGameStarted(false);

    setGameWon(false);

    setGameLost(false);

    setResultSaved(false);

    setGameId((previousId) => previousId + 1);

  };

  // -------------------------

  // CHANGE LEVEL

  // -------------------------

  const changeLevel = (newLevel) => {

    setLevel(newLevel);

    setFlippedCards([]);

    setMatchedCards([]);

    setMoves(0);

    setTime(0);

    setGameStarted(false);

    setGameWon(false);

    setGameLost(false);

    setResultSaved(false);

    setGameId((previousId) => previousId + 1);

  };

  // -------------------------

  // STATISTICS

  // -------------------------

  const matchedPairs = matchedCards.length / 2;

  const totalPairs = totalCards / 2;

  const accuracy =

    moves === 0

      ? 0

      : Math.round((matchedPairs / moves) * 100);

  return (

    <div className="game">

      {/* HEADER */}

      <header className="game-header">

        <h1 className="title">

          Memory Match

        </h1>

        <p className="subtitle">

          Test your memory

        </p>

      </header>

      {/* MAIN */}

      <main className="game-layout">

        {/* LEFT STATS */}

        <aside className="side-panel left-panel">

          <div className="panel-heading">

            <span className="heading-line"></span>

            GAME STATS

          </div>

          {/* MOVES */}

          <div className="big-stat">

            <span>

              MOVES

            </span>

            <strong>

              {moves}

              <small> / {maxMoves}</small>

            </strong>

          </div>

          {/* TIME */}

          <div className="big-stat">

            <span>

              TIME

            </span>

            <strong>

              {formatTime(time)}

              <small>

                {" "}

                / {formatTime(maxTime)}

              </small>

            </strong>

          </div>

          {/* CARDS */}

          <div className="big-stat">

            <span>

              CARDS LEFT

            </span>

            <strong>

              {cardsLeft}

              <small>

                {" "}

                / {totalCards}

              </small>

            </strong>

          </div>

          {/* PROGRESS */}

          <div className="progress-container">

            <div className="progress-label">

              <span>

                PROGRESS

              </span>

              <span>

                {Math.round(

                  ((totalCards - cardsLeft) /

                    totalCards) *

                    100

                )}%

              </span>

            </div>

            <div className="progress-bar">

              <div

                className="progress-fill"

                style={{

                  width: `${

                    ((totalCards - cardsLeft) /

                      totalCards) *

                    100

                  }%`

                }}

              />

            </div>

          </div>

        </aside>

        {/* CENTER */}

        <section className="board-section">

          <div className="board-top">

            <div>

              <span className="board-label">

                LEVEL

              </span>

              <strong>

                {level === "E"

                  ? "EASY"

                  : level === "M"

                  ? "MEDIUM"

                  : "HARD"}

              </strong>

            </div>

            <div>

              <span className="board-label">

                GRID

              </span>

              <strong>

                {size} × {size}

              </strong>

            </div>

          </div>

          {/* BOARD */}

          <div

            className={`game-board board-${level}`}

            style={{

              gridTemplateColumns:

                `repeat(${size}, minmax(0, 1fr))`

            }}

          >

            {cards.map((card) => {

              const isFlipped =

                flippedCards.includes(card.id);

              const isMatched =

                matchedCards.includes(card.id);

              return (

                <div

                  className={`card ${

                    isMatched ? "matched" : ""

                  } ${

                    isFlipped ? "flipped" : ""

                  }`}

                  key={card.id}

                  onClick={() =>

                    handleCardClick(card.id)

                  }

                >

                  <div className="card-inner">

                    <div className="card-front">

                      <span>?</span>

                    </div>

                    <div className="card-back">

                      {card.value}

                    </div>

                  </div>

                </div>

              );

            })}

          </div>

        </section>

        {/* RIGHT */}

        <aside className="side-panel right-panel">

          <div className="panel-heading">

            <span className="heading-line"></span>

            DIFFICULTY

          </div>

          <div className="level-options">

            <button

              className={`level-option ${

                level === "E" ? "selected" : ""

              }`}

              onClick={() => changeLevel("E")}

            >

              <span className="level-letter">

                E

              </span>

              <span>

                <strong>

                  Easy

                </strong>

                <small>

                  2 × 2 · 6 moves · 30 sec

                </small>

              </span>

            </button>

            <button

              className={`level-option ${

                level === "M" ? "selected" : ""

              }`}

              onClick={() => changeLevel("M")}

            >

              <span className="level-letter">

                M

              </span>

              <span>

                <strong>

                  Medium

                </strong>

                <small>

                  4 × 4 · 30 moves · 90 sec

                </small>

              </span>

            </button>

            <button

              className={`level-option ${

                level === "H" ? "selected" : ""

              }`}

              onClick={() => changeLevel("H")}

            >

              <span className="level-letter">

                H

              </span>

              <span>

                <strong>

                  Hard

                </strong>

                <small>

                  8 × 8 · 100 moves · 180 sec

                </small>

              </span>

            </button>

          </div>

          <button

            className="restart-button"

            onClick={restartGame}

          >

            <span>↻</span>

            New Game

          </button>

        </aside>

      </main>

      {/* BACKEND STATS / LEADERBOARD */}

      <section className="backend-section">

        <div className="backend-card">          <div className="panel-heading">

            <span className="heading-line"></span>

            SERVER STATS

          </div>

          {backendLoading ? (

            <p>Loading...</p>

          ) : backendError ? (

            <p>{backendError}</p>

          ) : backendStats ? (

            <div style={{ display: "grid", gap: "14px" }}>

              <div className="big-stat"><span>TOTAL GAMES</span><strong>{backendStats.totalGames}</strong></div>

              <div className="big-stat"><span>WINS</span><strong>{backendStats.wins}</strong></div>

              <div className="big-stat"><span>LOSSES</span><strong>{backendStats.losses}</strong></div>

              <div className="big-stat"><span>WIN RATE</span><strong>{backendStats.winRate}%</strong></div>

              <div className="big-stat"><span>BEST MOVES</span><strong>{backendStats.bestMoves ?? "—"}</strong></div>

              <div className="big-stat"><span>BEST TIME</span><strong>{backendStats.bestTime != null ? formatTime(backendStats.bestTime) : "—"}</strong></div>

            </div>

          ) : (

            <p>No statistics available yet.</p>

          )}

        </div>

        <div className="backend-card">          <div className="panel-heading">

            <span className="heading-line"></span>

            {level === "E" ? "EASY" : level === "M" ? "MEDIUM" : "HARD"} LEADERBOARD

          </div>

          {backendLoading ? (

            <p>Loading...</p>

          ) : leaderboard.length === 0 ? (

            <p>No completed games for this level yet.</p>

          ) : (

            <div style={{ overflowX: "auto" }}>

              <table style={{ width: "100%", borderCollapse: "collapse" }}>

                <thead><tr>

                  <th style={{ textAlign: "left", padding: "10px" }}>#</th>

                  <th style={{ textAlign: "left", padding: "10px" }}>MOVES</th>

                  <th style={{ textAlign: "left", padding: "10px" }}>TIME</th>

                  <th style={{ textAlign: "left", padding: "10px" }}>DATE</th>

                </tr></thead>

                <tbody>

                  {leaderboard.map((game, index) => (

                    <tr key={game.id}>

                      <td style={{ padding: "10px" }}>{index + 1}</td>

                      <td style={{ padding: "10px" }}>{game.moves}</td>

                      <td style={{ padding: "10px" }}>{formatTime(game.time)}</td>

                      <td style={{ padding: "10px" }}>{new Date(game.createdAt).toLocaleString()}</td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </section>

      {/* WIN / LOSE */}

      {(gameWon || gameLost) && (

        <div className="win-overlay">

          <div className="win-card">

            <div className="win-icon">

              {gameWon ? "✓" : "!"}

            </div>

            <span className="win-small">

              {gameWon

                ? "GAME COMPLETE"

                : "GAME OVER"}

            </span>

            <h2>

              {gameWon

                ? "Excellent Memory!"

                : "Time's Up!"}

            </h2>

            <p>

              {gameWon

                ? "You matched every pair."

                : "Try again and beat the limit."}

            </p>

            <div className="final-stats">

              <div>

                <span>

                  MOVES

                </span>

                <strong>

                  {moves}

                </strong>

              </div>

              <div>

                <span>

                  TIME

                </span>

                <strong>

                  {formatTime(time)}

                </strong>

              </div>

              <div>

                <span>

                  ACCURACY

                </span>

                <strong>

                  {accuracy}%

                </strong>

              </div>

            </div>

            <button

              className="play-again-button"

              onClick={restartGame}

            >

              Play Again

            </button>

          </div>

        </div>

      )}

    </div>

  );

}

export default App;

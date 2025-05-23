import { useState, useEffect } from "react";
import confetti from "canvas-confetti";

const WORDS = [
  { word: "apple", hint: "A popular fruit that keeps doctors away." },
  { word: "banana", hint: "A yellow tropical fruit monkeys love." },
  { word: "cherry", hint: "A small red fruit often seen on top of desserts." },
  { word: "grapes", hint: "Used to make wine." },
  { word: "orange", hint: "Also a color, rich in vitamin C." },
  { word: "mango", hint: "Known as the king of fruits, tropical and sweet." },
  { word: "kiwi", hint: "A small fuzzy fruit with bright green flesh." },
  { word: "peach", hint: "A soft fruit with fuzzy skin and a big pit." },
  { word: "plum", hint: "A small purple fruit often dried as a prune." },
  { word: "pear", hint: "A fruit shaped like a teardrop, juicy and sweet." },
  { word: "melon", hint: "A large fruit, often green or orange inside." },
  { word: "papaya", hint: "Tropical fruit with orange flesh and black seeds." },
  { word: "lemon", hint: "A sour yellow citrus fruit used in drinks." },
  { word: "fig", hint: "A sweet fruit with tiny seeds, often dried." },
  { word: "date", hint: "Sweet fruit commonly eaten dried, popular in the Middle East." },
];

function getRandomWordObj(excludeWord) {
  let newWordObj;
  do {
    newWordObj = WORDS[Math.floor(Math.random() * WORDS.length)];
  } while (newWordObj.word === excludeWord);
  return newWordObj;
}

function App() {
  const [wordObj, setWordObj] = useState(getRandomWordObj(""));
  const [revealedIndexes, setRevealedIndexes] = useState([]);
  const [wrongGuesses, setWrongGuesses] = useState([]);
  const [message, setMessage] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [roundsPlayed, setRoundsPlayed] = useState(0);
  const [score, setScore] = useState(0);
  const [shakeWrong, setShakeWrong] = useState(false);

  const word = wordObj.word;
  const isWinner = word.split("").every((_, i) => revealedIndexes.includes(i));
  const isLoser = wrongGuesses.length >= 6;
  const gameOver = isWinner || isLoser;

  // Confetti on win
  useEffect(() => {
    if (isWinner) {
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.6 },
      });
    }
  }, [isWinner]);

  // Listen for keyboard input
  useEffect(() => {
    if (gameOver) return;

    function handleKeyDown(e) {
      const letter = e.key.toLowerCase();
      if (!letter.match(/^[a-z]$/)) return;

      const unrevealedIndexes = word
        .split("")
        .map((l, i) => (l === letter && !revealedIndexes.includes(i) ? i : null))
        .filter((i) => i !== null);

      if (unrevealedIndexes.length > 0) {
        const nextIndex = unrevealedIndexes[0];
        setRevealedIndexes((prev) => [...prev, nextIndex]);
        setMessage(`✅ Good job! The letter "${letter.toUpperCase()}" is correct!`);
        setShowHint(false);
      } else {
        if (!word.includes(letter) && !wrongGuesses.includes(letter)) {
          setWrongGuesses((prev) => [...prev, letter]);
          setShowHint(true);
          setMessage(`❌ Oops! The letter "${letter.toUpperCase()}" is not in the word.`);
          setShakeWrong(true);
          setTimeout(() => setShakeWrong(false), 600);
        } else if (word.includes(letter)) {
          setMessage(`⚠️ You've already revealed all "${letter.toUpperCase()}" letters.`);
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [word, revealedIndexes, wrongGuesses, gameOver]);

  const maskedWord = word.split("").map((letter, index) => (
    <span
      key={index}
      className={`letter ${revealedIndexes.includes(index) ? "revealed" : ""}`}
      style={{ animationDelay: `${index * 120}ms` }}
    >
      {revealedIndexes.includes(index) ? letter : "_"}
    </span>
  ));

  const resetGame = () => {
    if (isWinner) setScore((prev) => prev + 1);
    setRoundsPlayed((prev) => prev + 1);
    const newWordObj = getRandomWordObj(wordObj.word);
    setWordObj(newWordObj);
    setRevealedIndexes([]);
    setWrongGuesses([]);
    setShowHint(false);
    setMessage("");
  };

  return (
    <>
      <style>{`
        body, html, #root {
          height: 100%;
          margin: 0;
          background: linear-gradient(135deg,rgb(126, 17, 203) 0%,rgb(37, 159, 252) 100%);
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: #f0f0f0;
          user-select: none;
        }
        .app {
          max-width: 480px;
          margin: 2rem auto;
          background: rgba(0,0,0,0.3);
          border-radius: 15px;
          padding: 2rem 1.5rem 3rem;
          box-shadow: 0 8px 30px rgba(0,0,0,0.4);
          text-align: center;
          backdrop-filter: blur(8px);
        }
        h1 {
          font-weight: 900;
          font-size: 2.8rem;
          margin-bottom: 1rem;
          text-shadow: 0 0 12px #f39c12;
        }
        p {
          font-size: 1.1rem;
          margin: 0.5rem 0;
          text-shadow: 0 0 5px rgba(0,0,0,0.3);
        }
        .letter {
          font-size: 3.5rem;
          display: inline-block;
          width: 1.2em;
          margin: 0 0.07em;
          color: #fffbf0aa;
          border-bottom: 3px solid #fffbf077;
          transition: color 0.3s ease, transform 0.3s ease;
          opacity: 0.4;
          transform: scale(1);
          animation: fadeInScale 0.5s forwards;
        }
        .letter.revealed {
          color: #fff8dc;
          border-bottom-color: #f1c40f;
          opacity: 1;
          transform: scale(1.2);
          text-shadow: 0 0 10px #f1c40f;
        }
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 0.4;
            transform: scale(1);
          }
        }
        .wrong-guesses {
          font-weight: 700;
          font-size: 1.2rem;
          color: #e74c3c;
          margin-top: 0.3rem;
          transition: transform 0.2s;
        }
        .shake {
          animation: shakeX 0.6s;
          animation-timing-function: ease-in-out;
        }
        @keyframes shakeX {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-8px); }
          40%, 80% { transform: translateX(8px); }
        }
        .message {
          margin: 1rem 0;
          font-size: 1.25rem;
          min-height: 1.6em;
          font-weight: 600;
          text-shadow: 0 0 5px rgba(0,0,0,0.6);
          user-select: none;
        }
        .message.correct {
          color: #2ecc71;
        }
        .message.wrong {
          color: #e74c3c;
        }
        .hint {
          margin-top: 1rem;
          font-style: italic;
          font-size: 1.1rem;
          color: #3498db;
          text-shadow: 0 0 5px #2980b9;
          user-select: none;
        }
        button {
          margin-top: 1.5rem;
          padding: 12px 30px;
          font-size: 1.2rem;
          background: linear-gradient(45deg, #ff6b6b, #f06595);
          border: none;
          border-radius: 50px;
          color: white;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 6px 15px rgba(240, 101, 149, 0.6);
          transition: background 0.4s ease;
          user-select: none;
        }
        button:hover {
          background: linear-gradient(45deg, #f06595, #ff6b6b);
          box-shadow: 0 8px 20px rgba(240, 101, 149, 0.9);
        }
        footer {
          margin-top: 2rem;
          font-size: 1rem;
          color: #f0f0f0cc;
          user-select: none;
        }
      `}</style>

      <div className="app" role="main" aria-label="Word Guessing Game">
        <h1>Word Guessing Game 🎉</h1>

        <p>Press any letter key to guess:</p>
        <h2 aria-live="polite" aria-atomic="true" style={{ marginBottom: "1rem" }}>
          {maskedWord}
        </h2>

        <p
          className={`message ${
            message.includes("Oops") ? "wrong" : message.includes("Good") ? "correct" : ""
          }`}
          aria-live="polite"
          aria-atomic="true"
        >
          {message || "Start guessing by pressing a letter key!"}
        </p>

        <p
          className={`wrong-guesses ${shakeWrong ? "shake" : ""}`}
          aria-live="polite"
          aria-atomic="true"
        >
          Wrong guesses: {wrongGuesses.length > 0 ? wrongGuesses.join(", ") : "None"}
        </p>

        <p>Attempts left: <strong>{6 - wrongGuesses.length}</strong></p>

        {showHint && !gameOver && <p className="hint">💡 Hint: {wordObj.hint}</p>}

        {gameOver && (
          <>
            <h3 style={{ color: isWinner ? "#2ecc71" : "#e74c3c" }} aria-live="assertive">
              {isWinner
                ? "You won! 🎉"
                : `You lost! 😢 The word was "${word.toUpperCase()}"`}
            </h3>
            <button onClick={resetGame} aria-label="Play again">
              Play Again
            </button>
          </>
        )}

        <footer>
          Rounds Played: {roundsPlayed} | Score: {score}
        </footer>
      </div>
    </>
  );
}

export default App;

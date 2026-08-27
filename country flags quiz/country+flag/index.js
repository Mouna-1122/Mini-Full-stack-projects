import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

let totalCorrect = 0;
let quiz = [];
let currentQuestion = {};

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: "tree",
  port: 5433,
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Load quiz data from PostgreSQL
async function loadQuiz() {
  try {
    await db.connect();

    const result = await db.query("SELECT * FROM public.flags");

    quiz = result.rows;

    console.log(
      `Successfully loaded ${quiz.length} flags from PostgreSQL.`
    );

    await db.end();
  } catch (err) {
    console.error("Error connecting to PostgreSQL:", err);
    process.exit(1);
  }
}

// Get a random question
function nextQuestion() {
  const randomIndex = Math.floor(Math.random() * quiz.length);
  currentQuestion = quiz[randomIndex];
}

// GET home page
app.get("/", (req, res) => {
  totalCorrect = 0;

  nextQuestion();

  console.log(currentQuestion);

  res.render("index.ejs", {
    question: currentQuestion,
  });
});

// POST answer
app.post("/submit", (req, res) => {
  const answer = req.body.answer.trim();

  let isCorrect = false;

  if (
    currentQuestion.capital.toLowerCase() ===
    answer.toLowerCase()
  ) {
    totalCorrect++;
    console.log(totalCorrect);
    isCorrect = true;
  }

  nextQuestion();

  res.render("index.ejs", {
    question: currentQuestion,
    wasCorrect: isCorrect,
    totalScore: totalCorrect,
  });
});

// Load database first, then start server
loadQuiz().then(() => {
  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
});
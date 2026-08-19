import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const db = new pg.Client({
  user: "postgres",
  host: "::1",
  database: "world",
  password: "tree",
  port: 5433,
});

const app = express();
const port = 3000;

let quiz = [];
let totalCorrect = 0;
let currentQuestion = {};

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Load quiz data from PostgreSQL
async function loadQuiz() {
  try {
    console.log("Connecting to PostgreSQL...");

    await db.connect();

    console.log("Connected successfully!");

    const connectionInfo = await db.query(`
      SELECT
        current_database(),
        current_user,
        inet_server_addr(),
        inet_server_port()
    `);

    console.log("Connection information:");
    console.log(connectionInfo.rows[0]);

    const result = await db.query(
      "SELECT * FROM public.capitals"
    );

    quiz = result.rows;

    console.log(`Loaded ${quiz.length} capitals.`);
  } catch (err) {
    console.error("DATABASE ERROR:");
    console.error(err);
    process.exit(1);
  }
}

// Select a random question
function nextQuestion() {
  const randomIndex = Math.floor(Math.random() * quiz.length);
  currentQuestion = quiz[randomIndex];
}

// Home page
app.get("/", (req, res) => {
  totalCorrect = 0;

  if (quiz.length === 0) {
    return res.send("Quiz data could not be loaded.");
  }

  nextQuestion();

  console.log("Current question:", currentQuestion);

  res.render("index.ejs", {
    question: currentQuestion,
  });
});

// Submit answer
app.post("/submit", (req, res) => {
  const answer = req.body.answer.trim();

  let isCorrect = false;

  if (
    currentQuestion.capital.toLowerCase() ===
    answer.toLowerCase()
  ) {
    totalCorrect++;
    isCorrect = true;
  }

  nextQuestion();

  res.render("index.ejs", {
    question: currentQuestion,
    wasCorrect: isCorrect,
    totalScore: totalCorrect,
  });
});

// Start application only after database is loaded
loadQuiz().then(() => {
  app.listen(port, () => {
    console.log(
      `Server is running at http://localhost:${port}`
    );
  });
});
import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: "tree",
  port: 5433,
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Function to get all visited countries
async function checkVisited() {
  const result = await db.query("SELECT country_code FROM visited_countries");
  return result.rows.map((country) => country.country_code);
}

// Home Page
app.get("/", async (req, res) => {
  try {
    const countries = await checkVisited();

    res.render("index.ejs", {
      countries,
      total: countries.length,
    });
  } catch (err) {
    console.error(err);
  }
});

// Add New Country
app.post("/add", async (req, res) => {
  const input = req.body.country;

  try {
    const result = await db.query(
      `SELECT country_code
       FROM countries
       WHERE LOWER(country_name) LIKE '%' || $1 || '%'`,
      [input.toLowerCase()]
    );

    if (result.rows.length === 0) {
      throw new Error("Country not found");
    }

    const countryCode = result.rows[0].country_code;

    try {
      await db.query(
        "INSERT INTO visited_countries (country_code) VALUES ($1)",
        [countryCode]
      );

      res.redirect("/");
    } catch (err) {
      const countries = await checkVisited();

      res.render("index.ejs", {
        countries,
        total: countries.length,
        error: "Country has already been added, try again.",
      });
    }
  } catch (err) {
    const countries = await checkVisited();

    res.render("index.ejs", {
      countries,
      total: countries.length,
      error: "Country name does not exist, try again.",
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
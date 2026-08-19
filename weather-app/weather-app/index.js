const express = require("express");
const path = require("path");
const weatherRoutes = require("./routes/weather");

const app = express();
const PORT = process.env.PORT || 3000;

// --- View engine setup ---
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// --- Static assets (CSS) ---
app.use(express.static(path.join(__dirname, "public")));

// --- Routes ---
// All the app's logic (home page + weather lookup) lives in routes/weather.js
app.use("/", weatherRoutes);

// --- 404 handler ---
app.use((req, res) => {
  res.status(404).render("error", {
    message: "Page not found.",
  });
});

// --- Generic error handler (catches anything unexpected thrown in routes) ---
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).render("error", {
    message: "Something went wrong on our end. Please try again.",
  });
});

app.listen(PORT, () => {
  console.log(`Weather app listening at http://localhost:${PORT}`);
});

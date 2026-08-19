const express = require("express");
const axios = require("axios");
const router = express.Router();
const { describeWeatherCode } = require("../utils/weatherCodes");

// Base URLs for the two free, key-free, CORS-enabled Open-Meteo endpoints we use:
// 1) Geocoding API -> turns a city name typed by the user into latitude/longitude
// 2) Forecast API   -> turns latitude/longitude into current + daily weather data
const GEOCODING_API = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_API = "https://api.open-meteo.com/v1/forecast";

/**
 * GET /
 * Renders the search form (home page).
 */
router.get("/", (req, res) => {
  res.render("index", { error: null });
});

/**
 * GET /weather
 * Query param: city (string typed into the search form)
 *
 * Flow:
 *   1. Ask the Geocoding API to resolve the city name to lat/lon (+ nice display name).
 *   2. Ask the Forecast API for current conditions and a 5-day daily forecast at that location.
 *   3. Reshape the raw API data into something simple for the EJS view to render.
 */
router.get("/weather", async (req, res) => {
  const city = (req.query.city || "").trim();

  // --- Basic input validation (application-side error handling) ---
  if (!city) {
    return res.render("index", { error: "Please enter a city name to search." });
  }

  try {
    // --- Step 1: Geocode the city name into coordinates ---
    const geoResponse = await axios.get(GEOCODING_API, {
      params: { name: city, count: 1, language: "en", format: "json" },
    });

    const results = geoResponse.data.results;

    // The API returns no "results" key at all if nothing matches, so guard for that.
    if (!results || results.length === 0) {
      return res.render("index", {
        error: `Sorry, we couldn't find a place called "${city}". Try a different spelling or a nearby major city.`,
      });
    }

    const place = results[0];
    const { latitude, longitude, name, country, admin1 } = place;

    // --- Step 2: Fetch current + daily forecast for those coordinates ---
    const weatherResponse = await axios.get(FORECAST_API, {
      params: {
        latitude,
        longitude,
        current_weather: true,
        daily: "weathercode,temperature_2m_max,temperature_2m_min",
        timezone: "auto",
      },
    });

    const data = weatherResponse.data;
    const current = data.current_weather;
    const currentInfo = describeWeatherCode(current.weathercode);

    // --- Step 3: Reshape the 5-day daily forecast array into an easy-to-loop list ---
    const dailyForecast = data.daily.time.slice(0, 5).map((date, i) => {
      const code = data.daily.weathercode[i];
      const info = describeWeatherCode(code);
      return {
        date,
        icon: info.icon,
        description: info.description,
        max: Math.round(data.daily.temperature_2m_max[i]),
        min: Math.round(data.daily.temperature_2m_min[i]),
      };
    });

    // --- Render the results page with everything the view needs ---
    res.render("result", {
      locationName: [name, admin1, country].filter(Boolean).join(", "),
      current: {
        temperature: Math.round(current.temperature),
        windspeed: current.windspeed,
        icon: currentInfo.icon,
        description: currentInfo.description,
      },
      dailyForecast,
    });
  } catch (err) {
    // --- API/network error handling ---
    // Log the full error server-side for debugging...
    console.error("Error fetching weather data:", err.message);

    // ...but show the user a friendly, non-technical message instead of a stack trace.
    res.render("index", {
      error: "Something went wrong while fetching weather data. Please try again in a moment.",
    });
  }
});

module.exports = router;

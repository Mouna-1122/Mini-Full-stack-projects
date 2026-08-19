const express = require("express");
const axios = require("axios");
const router = express.Router();
const { formatCurrency, formatNumber, formatPercent } = require("../utils/formatters");

// Base URL for the free, key-free, CORS-enabled CoinGecko public API.
const COINGECKO_API = "https://api.coingecko.com/api/v3";

/**
 * GET /
 * Home page: shows a search box plus a browsable list of the top 10
 * cryptocurrencies by market cap, so users have something to click on
 * even before they search.
 */
router.get("/", async (req, res) => {
  try {
    const marketsResponse = await axios.get(`${COINGECKO_API}/coins/markets`, {
      params: {
        vs_currency: "inr",
        order: "market_cap_desc",
        per_page: 10,
        page: 1,
        sparkline: false,
      },
    });

    const topCoins = marketsResponse.data.map((coin) => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol.toUpperCase(),
      image: coin.image,
      price: formatCurrency(coin.current_price),
      change24h: formatPercent(coin.price_change_percentage_24h),
      isPositive: coin.price_change_percentage_24h >= 0,
    }));

    res.render("index", { error: null, topCoins });
  } catch (err) {
    console.error("Error fetching top coins:", err.message);
    // The page still works without the "top coins" list -- the search box
    // is the core feature, so we degrade gracefully rather than showing
    // a full error page.
    res.render("index", { error: null, topCoins: [] });
  }
});

/**
 * GET /crypto
 * Query param: coin (free-text name or symbol typed into the search form,
 * e.g. "bitcoin", "eth", "dogecoin")
 *
 * Flow:
 *   1. Use CoinGecko's /search endpoint to resolve free-text input into an
 *      exact coin id (CoinGecko requires an id like "bitcoin", not "BTC").
 *   2. Use the /coins/{id} endpoint to fetch full market data for that coin.
 *   3. Reshape the data for the EJS view.
 */
router.get("/crypto", async (req, res) => {
  const query = (req.query.coin || "").trim();

  // --- Basic input validation (application-side error handling) ---
  if (!query) {
    return res.render("index", { error: "Please enter a cryptocurrency name or symbol.", topCoins: [] });
  }

  try {
    // --- Step 1: Resolve free-text search into a CoinGecko coin id ---
    const searchResponse = await axios.get(`${COINGECKO_API}/search`, {
      params: { query },
    });

    const matches = searchResponse.data.coins;

    if (!matches || matches.length === 0) {
      return res.render("index", {
        error: `Sorry, we couldn't find a cryptocurrency matching "${query}". Try a different name or symbol (e.g. "bitcoin", "eth").`,
        topCoins: [],
      });
    }

    const coinId = matches[0].id;

    // --- Step 2: Fetch full market data for that coin ---
    const coinResponse = await axios.get(`${COINGECKO_API}/coins/${coinId}`, {
      params: {
        localization: false,
        tickers: false,
        market_data: true,
        community_data: false,
        developer_data: false,
        sparkline: false,
      },
    });

    const coin = coinResponse.data;
    const market = coin.market_data;

    // --- Step 3: Reshape the raw API response into simple view data ---
    const change24h = market.price_change_percentage_24h;

    res.render("result", {
      name: coin.name,
      symbol: coin.symbol.toUpperCase(),
      image: coin.image.large,
      rank: coin.market_cap_rank ? `#${coin.market_cap_rank}` : "N/A",
      price: formatCurrency(market.current_price.inr),
      change24h: formatPercent(change24h),
      isPositive: change24h >= 0,
      marketCap: formatCurrency(market.market_cap.inr),
      high24h: formatCurrency(market.high_24h.inr),
      low24h: formatCurrency(market.low_24h.inr),
      ath: formatCurrency(market.ath.inr),
      atl: formatCurrency(market.atl.inr),
      circulatingSupply: formatNumber(market.circulating_supply),
      description: coin.description.en
        ? coin.description.en.split(". ").slice(0, 2).join(". ") + "." // first couple sentences only
        : "No description available.",
    });
  } catch (err) {
    // --- API/network error handling ---
    // Log the full error server-side for debugging...
    console.error("Error fetching cryptocurrency data:", err.message);

    // ...but show the user a friendly, non-technical message instead of a stack trace.
    res.render("index", {
      error: "Something went wrong while fetching cryptocurrency data. Please try again in a moment.",
      topCoins: [],
    });
  }
});

module.exports = router;

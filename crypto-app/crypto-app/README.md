# 💰 Crypto Price Tracker

An Express/Node.js web app that lets users search for any cryptocurrency and see its **current price, 24h change, and market data — priced in Indian Rupees (₹)**, built using the free [CoinGecko API](https://www.coingecko.com/en/api). Features a dark, glassmorphism-style UI.

Built for the "Public API Integration" project — uses Express, Axios, and EJS as required.

## Why CoinGecko instead of the Blockchain.com API?

The project brief's example suggested the [Blockchain.com API](https://api.blockchain.com/v3/#/unauthenticated/getTickerBySymbol), but that ticker endpoint only covers a small set of blockchain.com-listed trading pairs. **CoinGecko** was chosen instead because it:

- Requires **no API key** and is **CORS-enabled**.
- Covers **thousands of coins**, searchable by name or symbol.
- Returns rich data per coin (price, market cap, 24h high/low, all-time high/low, circulating supply, description) — giving much more to manipulate and present.

## How it works

1. User types a coin name or symbol into the search form (e.g. `bitcoin`, `eth`, `dogecoin`), or clicks one of the top 10 coins listed on the home page.
2. The server calls CoinGecko's **`/search`** endpoint with Axios to resolve free-text input into an exact coin id (CoinGecko needs an id like `bitcoin`, not just `BTC`).
3. The server calls CoinGecko's **`/coins/{id}`** endpoint to fetch full market data for that coin.
4. Raw numbers from the API (price, market cap, supply, % change) are formatted into readable strings (see `utils/formatters.js`), and the 24h change is color-coded green/red.
5. Results are rendered with EJS templates and styled with plain CSS.
6. If the coin can't be found, or an API call fails, the user sees a friendly error message instead of a crash — the real error is also logged to the server console for debugging.

## Project structure

```
crypto-app/
├── index.js                 # Express app entry point, middleware, error handlers
├── routes/
│   └── crypto.js            # Route handlers + Axios calls to the CoinGecko API
├── utils/
│   └── formatters.js        # Currency/number/percent formatting helpers
├── views/
│   ├── index.ejs            # Home page (search form + top 10 coins)
│   ├── result.ejs           # Coin details page
│   └── error.ejs            # Generic error page (404 / 500)
├── public/
│   └── css/
│       └── style.css        # Styling
├── package.json
└── README.md
```

## Getting started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or later recommended)
- npm (comes with Node.js)

### Installation & running

```bash
# 1. Install dependencies
npm i

# 2. Start the server (with auto-restart on file changes)
nodemon index.js

# — or, without nodemon —
npm start
```

Then open your browser to:

```
http://localhost:3000
```

### Usage

1. On the home page, either type a coin name/symbol into the search box, or click one of the top 10 coins listed below it.
2. Click **Search**.
3. View the current price, 24h change, market cap, high/low, all-time high/low, circulating supply, and a short description.
4. Click **← New search** to look up another coin.

## APIs used

| API | Purpose | Docs |
|---|---|---|
| CoinGecko Search API | Resolve free-text input to a coin id | https://www.coingecko.com/en/api/documentation (`/search`) |
| CoinGecko Coin Data API | Get full market data for a coin id | https://www.coingecko.com/en/api/documentation (`/coins/{id}`) |
| CoinGecko Markets API | Get top coins by market cap for the home page list | https://www.coingecko.com/en/api/documentation (`/coins/markets`) |

## Error handling

- **Empty search** — form requires input; server also validates and re-renders the form with a message if bypassed.
- **Coin not found** — if the search endpoint returns no matches, the user sees a friendly "couldn't find that coin" message.
- **API/network failures** — wrapped in try/catch; the real error is logged with `console.error`, and the user sees a generic friendly message rather than a stack trace. The home page's "top coins" list also degrades gracefully (just doesn't show) if that particular call fails, rather than breaking the whole page.
- **404 routes** — any unmatched route renders a styled error page instead of Express's default HTML error.
- **Unhandled server errors** — caught by a final Express error-handling middleware in `index.js`.

## Note on rate limits

CoinGecko's free public API has a fairly generous but not unlimited rate limit. If you search very rapidly and see errors, wait a few seconds and try again.


/**
 * Open-Meteo returns weather conditions as WMO numeric codes (e.g. 0, 61, 95).
 * This lookup table converts those codes into a human-friendly description
 * and a simple emoji "icon" so we don't need a separate icon library/asset.
 *
 * Reference: https://open-meteo.com/en/docs (see "WMO Weather interpretation codes")
 */
const WEATHER_CODES = {
  0: { description: "Clear sky", icon: "☀️" },
  1: { description: "Mainly clear", icon: "🌤️" },
  2: { description: "Partly cloudy", icon: "⛅" },
  3: { description: "Overcast", icon: "☁️" },
  45: { description: "Fog", icon: "🌫️" },
  48: { description: "Depositing rime fog", icon: "🌫️" },
  51: { description: "Light drizzle", icon: "🌦️" },
  53: { description: "Moderate drizzle", icon: "🌦️" },
  55: { description: "Dense drizzle", icon: "🌦️" },
  56: { description: "Light freezing drizzle", icon: "🌧️" },
  57: { description: "Dense freezing drizzle", icon: "🌧️" },
  61: { description: "Slight rain", icon: "🌧️" },
  63: { description: "Moderate rain", icon: "🌧️" },
  65: { description: "Heavy rain", icon: "🌧️" },
  66: { description: "Light freezing rain", icon: "🌨️" },
  67: { description: "Heavy freezing rain", icon: "🌨️" },
  71: { description: "Slight snow fall", icon: "🌨️" },
  73: { description: "Moderate snow fall", icon: "🌨️" },
  75: { description: "Heavy snow fall", icon: "❄️" },
  77: { description: "Snow grains", icon: "❄️" },
  80: { description: "Slight rain showers", icon: "🌦️" },
  81: { description: "Moderate rain showers", icon: "🌦️" },
  82: { description: "Violent rain showers", icon: "⛈️" },
  85: { description: "Slight snow showers", icon: "🌨️" },
  86: { description: "Heavy snow showers", icon: "🌨️" },
  95: { description: "Thunderstorm", icon: "⛈️" },
  96: { description: "Thunderstorm with slight hail", icon: "⛈️" },
  99: { description: "Thunderstorm with heavy hail", icon: "⛈️" },
};

/**
 * Look up a weather code and return { description, icon }.
 * Falls back to a generic "Unknown" entry if Open-Meteo ever returns
 * a code that isn't in our table, so the app never crashes on this.
 */
function describeWeatherCode(code) {
  return WEATHER_CODES[code] || { description: "Unknown conditions", icon: "❔" };
}

module.exports = { describeWeatherCode };

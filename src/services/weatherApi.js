import { isPopulatedPlace, rankCityCandidates } from "./locationUtils";

const API_URLS = {
  geocoding:
    import.meta.env.VITE_GEOCODING_API ||
    "https://geocoding-api.open-meteo.com/v1/search",
  weather:
    import.meta.env.VITE_WEATHER_API ||
    "https://api.open-meteo.com/v1/forecast",
  airQuality:
    import.meta.env.VITE_AQI_API ||
    "https://air-quality-api.open-meteo.com/v1/air-quality",
};

const configuredCountry = import.meta.env.VITE_PREFERRED_COUNTRY_CODE;
const PREFERRED_COUNTRY_CODE =
  configuredCountry === undefined ? "IN" : configuredCountry.trim().toUpperCase();

async function fetchJson(url, signal) {
  const response = await fetch(url, { signal });
  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.error) {
    throw new Error(data.reason || `Request failed (${response.status}).`);
  }

  return data;
}

function makeCity(place) {
  return {
    id: String(
      place.id ?? `${place.name}-${place.latitude}-${place.longitude}`,
    ),
    name: place.name,
    admin1: place.admin1 ?? "",
    admin2: place.admin2 ?? "",
    country: place.country ?? "",
    countryCode: place.country_code ?? "",
    featureCode: place.feature_code ?? "",
    population: Number(place.population ?? 0),
    latitude: Number(place.latitude),
    longitude: Number(place.longitude),
    timezone: place.timezone ?? "auto",
  };
}

export function formatCityName(city) {
  if (!city) return "";
  const parts = [city.name, city.admin1, city.country].filter(Boolean);
  return [...new Set(parts)].join(", ");
}

export async function searchCities(query, signal) {
  const searchTerm = query.trim();
  if (searchTerm.length < 2) return [];

  const url = new URL(API_URLS.geocoding);
  url.searchParams.set("name", searchTerm);
  url.searchParams.set("count", "20");
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");

  const data = await fetchJson(url, signal);
  const seen = new Set();
  const cities = (data.results ?? [])
    .map(makeCity)
    .filter(isPopulatedPlace)
    .filter((city) => {
      const key = `${city.name.toLowerCase()}-${city.latitude.toFixed(4)}-${city.longitude.toFixed(4)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

  return rankCityCandidates(cities, searchTerm, PREFERRED_COUNTRY_CODE).slice(0, 10);
}

export async function fetchWeatherForCity(city, signal) {
  if (
    !city ||
    !Number.isFinite(Number(city.latitude)) ||
    !Number.isFinite(Number(city.longitude))
  ) {
    throw new Error("This location does not have valid map coordinates.");
  }

  const weatherUrl = new URL(API_URLS.weather);
  weatherUrl.searchParams.set("latitude", city.latitude);
  weatherUrl.searchParams.set("longitude", city.longitude);
  weatherUrl.searchParams.set(
    "current",
    [
      "temperature_2m",
      "apparent_temperature",
      "relative_humidity_2m",
      "is_day",
      "precipitation",
      "weather_code",
      "cloud_cover",
      "pressure_msl",
      "wind_speed_10m",
      "wind_direction_10m",
      "wind_gusts_10m",
      "visibility",
    ].join(","),
  );
  weatherUrl.searchParams.set(
    "hourly",
    [
      "temperature_2m",
      "precipitation_probability",
      "precipitation",
      "weather_code",
      "wind_speed_10m",
    ].join(","),
  );
  weatherUrl.searchParams.set(
    "daily",
    [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "sunrise",
      "sunset",
      "uv_index_max",
      "precipitation_probability_max",
      "precipitation_sum",
      "wind_speed_10m_max",
    ].join(","),
  );
  weatherUrl.searchParams.set("timezone", "auto");
  weatherUrl.searchParams.set("forecast_days", "7");
  weatherUrl.searchParams.set("wind_speed_unit", "kmh");

  const airUrl = new URL(API_URLS.airQuality);
  airUrl.searchParams.set("latitude", city.latitude);
  airUrl.searchParams.set("longitude", city.longitude);
  airUrl.searchParams.set("current", "us_aqi,pm2_5,pm10");
  airUrl.searchParams.set("timezone", "auto");

  // Weather is essential; AQI is optional so a temporary AQI outage won't
  // prevent the main dashboard from loading.
  const [weatherResult, airResult] = await Promise.allSettled([
    fetchJson(weatherUrl, signal),
    fetchJson(airUrl, signal),
  ]);

  if (weatherResult.status === "rejected") {
    throw weatherResult.reason;
  }

  const weather = weatherResult.value;
  if (!weather.current || !weather.hourly || !weather.daily) {
    throw new Error("The weather service returned incomplete forecast data.");
  }

  return {
    weather,
    airQuality:
      airResult.status === "fulfilled" ? airResult.value.current ?? null : null,
  };
}

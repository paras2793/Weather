import { useState } from "react";

import SearchBox from "./components/SearchBox";
import WeatherCard from "./components/WeatherCard";
import UVIndex from "./components/UVIndex";
import Wind from "./components/Wind";
import Humidity from "./components/Humidity";
import SunTimes from "./components/SunTimes";
import Visibility from "./components/Visibility";
import AirQuality from "./components/AirQuality";

function App() {
  const [city, setCity] = useState("");
  const [displayedCity, setDisplayedCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [airQuality, setAirQuality] = useState(null);
  const [unit, setUnit] = useState("C");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function fetchWeather() {
    const searchCity = city.trim();

    if (searchCity === "" || loading) {
      return;
    }

    setLoading(true);
    setError("");
    setAirQuality(null);

    try {
      const geocodingApiUrl = import.meta.env.VITE_GEOCODING_API_URL;
      const weatherApiUrl = import.meta.env.VITE_WEATHER_API_URL;

      if (!geocodingApiUrl || !weatherApiUrl) {
        throw new Error("Check the API URLs in your .env file.");
      }
   
      const geocodingUrl = new URL(geocodingApiUrl);
      geocodingUrl.searchParams.set("name", searchCity);
      geocodingUrl.searchParams.set("count", "1");

      const geocodingResponse = await fetch(geocodingUrl);
      const geocodingData = await geocodingResponse.json();
      const location = geocodingData.results && geocodingData.results[0];

      if (!geocodingResponse.ok || geocodingData.error || !location) {
        throw new Error("City not found. Check the spelling and try again.");
      }

      const weatherUrl = new URL(weatherApiUrl);
      weatherUrl.searchParams.set("latitude", location.latitude);
      weatherUrl.searchParams.set("longitude", location.longitude);
      weatherUrl.searchParams.set(
        "current",
        "temperature_2m,wind_speed_10m,relative_humidity_2m,weather_code,visibility"
      );
      weatherUrl.searchParams.set("daily", "sunrise,sunset,uv_index_max");
      weatherUrl.searchParams.set("timezone", "auto");
      weatherUrl.searchParams.set("forecast_days", "1");

      const weatherResponse = await fetch(weatherUrl);
      const weatherData = await weatherResponse.json();

      if (
        !weatherResponse.ok ||
        weatherData.error ||
        !weatherData.current ||
        !weatherData.daily
      ) {
        throw new Error("Could not load weather. Please try again.");
      }

      const current = weatherData.current;
      const daily = weatherData.daily;

      setDisplayedCity(location.name);
      setWeather({
        temperature: current.temperature_2m,
        condition: current.weather_code,
        wind: current.wind_speed_10m,
        humidity: current.relative_humidity_2m,
        visibility:
          current.visibility == null
            ? null
            : (current.visibility / 1000).toFixed(1),
        sunrise: daily.sunrise && daily.sunrise[0],
        sunset: daily.sunset && daily.sunset[0],
        uvIndex: daily.uv_index_max && daily.uv_index_max[0],
      });


      const airQualityUrl = new URL(
        import.meta.env.VITE_AQI_API_URL
      );
      airQualityUrl.searchParams.set("latitude", location.latitude);
      airQualityUrl.searchParams.set("longitude", location.longitude);
      airQualityUrl.searchParams.set("current", "us_aqi");
      airQualityUrl.searchParams.set("timezone", "auto");

      try {
        const airQualityResponse = await fetch(airQualityUrl);
        const airQualityData = await airQualityResponse.json();

        if (airQualityResponse.ok && airQualityData.current) {
          setAirQuality(airQualityData.current.us_aqi ?? null);
        }
      } catch {
        setAirQuality(null);
      }

      setCity("");
    } catch (error) {
      setError(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-200 p-4">
      <div className="mx-auto grid min-h-screen w-full max-w-6xl grid-cols-1 overflow-hidden rounded-3xl bg-gray-100 shadow-lg lg:grid-cols-3">
        <aside className="flex min-w-0 flex-col bg-white p-6 lg:col-span-1">
          <SearchBox
            city={city}
            setCity={setCity}
            onSearch={fetchWeather}
            loading={loading}
          />

          {error && (
            <p className="mt-4 rounded-lg bg-red-100 p-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <WeatherCard
            city={displayedCity}
            weather={weather}
            unit={unit}
            loading={loading}
          />
        </aside>

        <main className="flex min-w-0 flex-col bg-gray-100 p-6 lg:col-span-2">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                Today's Highlights
              </h2>
            </div>

            <div className="flex items-center gap-2 rounded-full bg-white p-1 shadow-sm">
              <button
                onClick={() => setUnit("C")}
                className={unit === "C" ? "rounded-full bg-gray-900 px-3 py-2 text-sm font-semibold text-white" : "rounded-full bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700"}
              >
                °C
              </button>
              <button
                onClick={() => setUnit("F")}
                className={unit === "F" ? "rounded-full bg-gray-900 px-3 py-2 text-sm font-semibold text-white" : "rounded-full bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700"}
              >
                °F
              </button>
            </div>
          </div>

          <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
            <UVIndex value={weather?.uvIndex} />
            <Wind value={weather?.wind} />
            <SunTimes
              sunrise={weather?.sunrise}
              sunset={weather?.sunset}
            />
            <Humidity value={weather?.humidity} />
            <Visibility value={weather?.visibility} />
            <AirQuality value={airQuality} />
          </div>

        </main>
      </div>
    </div>
  );
}

export default App;
/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";

import SearchBox from "./components/SearchBox";
import WeatherCard from "./components/WeatherCard";
import UVIndex from "./components/UVIndex";
import Wind from "./components/Wind";
import Humidity from "./components/Humidity";
import SunTimes from "./components/SunTimes";
import Visibility from "./components/Visibility";
import AirQuality from "./components/AirQuality";
import WeeklyForecast from "./components/WeeklyForecast";

function App({ initialCity = "" }) {
  const [city, setCity] = useState(initialCity);
  const [displayedCity, setDisplayedCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [dailyForecast, setDailyForecast] = useState(null);
  const [airQuality, setAirQuality] = useState(null);
  const [unit, setUnit] = useState("C");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function fetchWeatherForCity(cityName) {
    const searchCity = cityName.trim();

    if (!searchCity) return;

    setLoading(true);
    setError("");
    setAirQuality(null);
    setDailyForecast(null);

    try {
      const geocodingApiUrl = import.meta.env.VITE_GEOCODING_API_URL;
      const weatherApiUrl = import.meta.env.VITE_WEATHER_API_URL;
      const aqiApiUrl = import.meta.env.VITE_AQI_API_URL;

      if (!geocodingApiUrl || !weatherApiUrl) {
        throw new Error("Check your API URLs in the .env file.");
      }

      const geocodingUrl = new URL(geocodingApiUrl);
      geocodingUrl.searchParams.set("name", searchCity);
      geocodingUrl.searchParams.set("count", "1");

      const geocodingResponse = await fetch(geocodingUrl);
      const geocodingData = await geocodingResponse.json();

      const location = geocodingData.results?.[0];

      if (!geocodingResponse.ok || geocodingData.error || !location) {
        throw new Error("City not found. Please check the spelling.");
      }

      const weatherUrl = new URL(weatherApiUrl);

      weatherUrl.searchParams.set("latitude", location.latitude);
      weatherUrl.searchParams.set("longitude", location.longitude);

      weatherUrl.searchParams.set(
        "current",
        "temperature_2m,wind_speed_10m,relative_humidity_2m,weather_code,visibility"
      );

      weatherUrl.searchParams.set(
        "daily",
        "sunrise,sunset,uv_index_max,temperature_2m_max,temperature_2m_min,weather_code"
      );

      weatherUrl.searchParams.set("timezone", "auto");
      weatherUrl.searchParams.set("forecast_days", "10");

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

      setDisplayedCity(
        `${location.name}${location.country ? `, ${location.country}` : ""}`
      );

      setDailyForecast(daily);
      setWeather({
        temperature: current.temperature_2m,
        condition: current.weather_code,
        wind: current.wind_speed_10m,
        humidity: current.relative_humidity_2m,
        visibility:
          current.visibility == null
            ? null
            : (current.visibility / 1000).toFixed(1),
        sunrise: daily.sunrise?.[0],
        sunset: daily.sunset?.[0],
        uvIndex: daily.uv_index_max?.[0],
      });

      if (aqiApiUrl) {
        const airQualityUrl = new URL(aqiApiUrl);

        airQualityUrl.searchParams.set("latitude", location.latitude);
        airQualityUrl.searchParams.set("longitude", location.longitude);
        airQualityUrl.searchParams.set("current", "us_aqi");
        airQualityUrl.searchParams.set("timezone", "auto");

        try {
          const aqiResponse = await fetch(airQualityUrl);
          const aqiData = await aqiResponse.json();

          if (aqiResponse.ok && aqiData.current) {
            setAirQuality(aqiData.current.us_aqi ?? null);
          }
        } catch {
          setAirQuality(null);
        }
      }

      setCity("");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (initialCity) {
      setCity(initialCity);
      fetchWeatherForCity(initialCity);
    }
  }, [initialCity]);

  function fetchWeather() {
    fetchWeatherForCity(city);
  }

  return (
    <div className="min-h-screen bg-slate-200 p-3 sm:p-6">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-slate-100 shadow-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          <aside className="flex flex-col gap-5 bg-white p-5 sm:p-7 lg:col-span-4">

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Weather Dashboard
              </h1>
            </div>

            <SearchBox
              city={city}
              setCity={setCity}
              onSearch={fetchWeather}
              loading={loading}
            />

            {error && (
              <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
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

          <main className="min-w-0 p-5 sm:p-7 lg:col-span-8">

            <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
              <div>

                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                  Weather Details
                </h2>

                <p className="mt-1 text-md text-slate-500">
                  {displayedCity || "Search a city to get started"}
                </p>
              </div>

              <div className="flex items-center gap-1 rounded-full bg-white p-1 shadow-sm">
                <button
                  onClick={() => setUnit("C")}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    unit === "C"
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  °C
                </button>

                <button
                  onClick={() => setUnit("F")}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    unit === "F"
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  °F
                </button>
              </div>
            </div>

            <section className="mb-9">
              <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">
                <WeeklyForecast
                  dailyData={dailyForecast}
                  unit={unit}
                />
              </div>

            </section>
            <section>
              <div className="mb-5">
                <h2 className="text-xl font-bold text-slate-900">
                  Today's Highlights
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
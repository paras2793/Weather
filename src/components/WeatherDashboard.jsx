import { motion } from "motion/react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Leaf,
} from "lucide-react";
import { formatCityName } from "../services/weatherApi";
import { HourlyTemperatureChart, RainfallChart } from "./WeatherCharts";
import WeatherInsights from "./WeatherInsights";
import WeatherMap from "./WeatherMap";

const WEATHER_CONDITIONS = {
  0: ["Clear sky", "☀️"],
  1: ["Mainly clear", "🌤️"],
  2: ["Partly cloudy", "⛅"],
  3: ["Overcast", "☁️"],
  45: ["Fog", "🌫️"],
  48: ["Rime fog", "🌫️"],
  51: ["Light drizzle", "🌦️"],
  53: ["Drizzle", "🌦️"],
  55: ["Heavy drizzle", "🌧️"],
  56: ["Freezing drizzle", "🌧️"],
  57: ["Heavy freezing drizzle", "🌧️"],
  61: ["Light rain", "🌦️"],
  63: ["Rain", "🌧️"],
  65: ["Heavy rain", "🌧️"],
  66: ["Freezing rain", "🌧️"],
  67: ["Heavy freezing rain", "🌧️"],
  71: ["Light snow", "🌨️"],
  73: ["Snow", "❄️"],
  75: ["Heavy snow", "❄️"],
  77: ["Snow grains", "🌨️"],
  80: ["Rain showers", "🌦️"],
  81: ["Heavy showers", "🌧️"],
  82: ["Violent showers", "⛈️"],
  85: ["Snow showers", "🌨️"],
  86: ["Heavy snow showers", "❄️"],
  95: ["Thunderstorm", "⛈️"],
  96: ["Thunderstorm with hail", "⛈️"],
  99: ["Heavy thunderstorm", "⛈️"],
};

function getCondition(code) {
  return WEATHER_CONDITIONS[code] ?? ["Weather conditions", "🌤️"];
}

function displayTemperature(value, unit) {
  if (value == null || Number.isNaN(Number(value))) return "--";
  const temperature = unit === "F" ? (Number(value) * 9) / 5 + 32 : Number(value);
  return Math.round(temperature);
}

function formatTime(value) {
  if (!value) return "--";
  const time = value.split("T")[1];
  if (!time) return "--";
  const [hour, minute] = time.split(":");
  const date = new Date();
  date.setHours(Number(hour), Number(minute), 0, 0);
  return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

function getAqiStatus(value) {
  if (value == null) return { label: "Unavailable", color: "text-slate-400", note: "Air quality reading unavailable" };
  if (value <= 50) return { label: "Good", color: "text-emerald-300", note: "Air quality is considered satisfactory" };
  if (value <= 100) return { label: "Moderate", color: "text-lime-300", note: "Acceptable; unusually sensitive people may take care" };
  if (value <= 150) return { label: "Sensitive groups", color: "text-amber-300", note: "Sensitive groups may experience health effects" };
  if (value <= 200) return { label: "Unhealthy", color: "text-orange-300", note: "Some members of the general public may experience effects" };
  if (value <= 300) return { label: "Very unhealthy", color: "text-rose-300", note: "Health alert: reduce prolonged outdoor exertion" };
  return { label: "Hazardous", color: "text-red-300", note: "Health warning: avoid prolonged outdoor activity" };
}

function WeeklyForecast({ daily, unit }) {
  if (!daily?.time?.length) return null;

  return (
    <section className="glass-panel rounded-[24px] p-4 sm:p-5">
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <p className="section-kicker">Plan ahead</p>
          <h3 className="mt-1 text-base font-semibold text-slate-800">7-day forecast</h3>
        </div>
        <p className="text-[10px] text-slate-400">Daily high / low · °{unit}</p>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
        {daily.time.slice(0, 7).map((date, index) => {
          const [condition, emoji] = getCondition(daily.weather_code?.[index]);
          const day = index === 0
            ? "Today"
            : new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { weekday: "short" });
          const high = displayTemperature(daily.temperature_2m_max?.[index], unit);
          const low = displayTemperature(daily.temperature_2m_min?.[index], unit);
          const rain = Math.round(daily.precipitation_probability_max?.[index] ?? 0);

          return (
            <motion.div
              key={date}
              whileHover={{ y: -3, backgroundColor: "rgba(255,255,255,0.075)" }}
              className={`rounded-xl border px-2 py-3 text-center ${index === 0 ? "border-sky-200 bg-sky-50" : "border-slate-100 bg-white/70"}`}
            >
              <p className={`text-xs font-semibold ${index === 0 ? "text-sky-700" : "text-slate-600"}`}>{day}</p>
              <span className="my-3 block text-3xl" aria-label={condition}>{emoji}</span>
              <div className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-800">
                <span>{high}°</span>
                <span className="text-slate-500">{low}°</span>
              </div>
              <p className="mt-2 text-[10px] text-slate-400">💧 {rain}%</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

function AirQualityPanel({ airQuality }) {
  const aqi = airQuality?.us_aqi ?? null;
  const status = getAqiStatus(aqi);
  const progress = aqi == null ? 0 : Math.min((aqi / 300) * 100, 100);

  return (
    <section className="glass-panel rounded-[24px] p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="section-kicker">Environment</p>
          <h3 className="mt-1 text-lg font-semibold text-white">Air quality</h3>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-300/10 text-emerald-200">
          <Leaf size={18} />
        </span>
      </div>

      <div className="mt-6 flex items-end gap-3">
        <p className="text-5xl font-semibold tracking-tight text-white">{aqi ?? "--"}</p>
        <div className="pb-1">
          <p className={`text-sm font-semibold ${status.color}`}>{status.label}</p>
          <p className="text-[10px] text-slate-400">US AQI</p>
        </div>
      </div>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/[0.08]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-300 via-amber-300 to-rose-400 transition-all duration-700"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-3 min-h-8 text-[11px] leading-5 text-slate-400">{status.note}</p>

      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/[0.08] pt-4">
        <div>
          <p className="text-[10px] text-slate-400">PM2.5</p>
          <p className="mt-1 text-lg font-semibold text-white">
            {airQuality?.pm2_5 != null ? airQuality.pm2_5.toFixed(1) : "--"}
            <span className="ml-1 text-[10px] font-normal text-slate-400">µg/m³</span>
          </p>
        </div>
        <div>
          <p className="text-[10px] text-slate-400">PM10</p>
          <p className="mt-1 text-lg font-semibold text-white">
            {airQuality?.pm10 != null ? airQuality.pm10.toFixed(1) : "--"}
            <span className="ml-1 text-[10px] font-normal text-slate-400">µg/m³</span>
          </p>
        </div>
      </div>
      {aqi == null && (
        <p className="mt-3 text-[10px] text-slate-500">The weather forecast is available; the air-quality service did not return a reading.</p>
      )}
    </section>
  );
}

function WeatherHero({ city, current, daily, unit }) {
  const [condition, emoji] = getCondition(current.weather_code);
  const high = displayTemperature(daily?.temperature_2m_max?.[0], unit);
  const low = displayTemperature(daily?.temperature_2m_min?.[0], unit);
  const temperature = displayTemperature(current.temperature_2m, unit);
  const feelsLike = displayTemperature(current.apparent_temperature, unit);
  const date = current.time?.slice(0, 10);
  const prettyDate = date
    ? new Date(`${date}T12:00:00`).toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    : new Date().toLocaleDateString();

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="weather-hero relative isolate flex h-full min-h-[300px] flex-col justify-between overflow-hidden rounded-[26px] p-5 shadow-sm sm:p-6"
    >
      <div className="pointer-events-none absolute -right-16 -top-28 -z-10 h-80 w-80 rounded-full bg-cyan-200/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 right-1/3 -z-10 h-64 w-64 rounded-full bg-violet-300/10 blur-3xl" />

      <div className="flex flex-col justify-between gap-7 sm:flex-row sm:items-center">
        <div className="relative z-10 min-w-0">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/55 px-3 py-1.5 backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.9)]" />
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-sky-700">Current conditions</span>
          </div>
          <p className="text-sm font-medium text-slate-600">{prettyDate}</p>
          <h2 className="mt-1 max-w-2xl text-xl font-semibold tracking-tight text-slate-800 sm:text-2xl">{formatCityName(city)}</h2>

          <div className="mt-7 flex items-center gap-3 sm:gap-4">
            <p className="text-[64px] font-light leading-none tracking-[-0.07em] text-slate-900 sm:text-[76px]">{temperature}°{unit}</p>
            <div className="pb-1">
              <p className="text-base font-semibold text-slate-800">{condition}</p>
              <p className="mt-1 text-xs text-slate-600">Feels like {feelsLike}°{unit}</p>
              <div className="mt-3 flex items-center gap-3 text-xs text-slate-600">
                <span className="flex items-center gap-1"><ArrowUpRight size={13} /> {high}°{unit}</span>
                <span className="flex items-center gap-1"><ArrowDownRight size={13} /> {low}°{unit}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative flex min-h-36 items-center justify-center sm:min-h-52 sm:min-w-[230px]">
          <div className="absolute h-40 w-40 rounded-full bg-white/65 blur-2xl sm:h-52 sm:w-52" />
          <motion.span
            initial={{ opacity: 0, scale: 0.75, rotate: -8 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 14, delay: 0.1 }}
            className="relative select-none text-[100px] drop-shadow-[0_12px_18px_rgba(15,23,42,0.12)] sm:text-[120px]"
            aria-label={condition}
          >
            {emoji}
          </motion.span>
        </div>
      </div>

      <div className="mt-7 grid grid-cols-2 gap-3 border-t border-slate-200/80 pt-4 sm:grid-cols-4">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-500">Wind</p>
          <p className="mt-1 text-sm font-semibold text-slate-800">{current.wind_speed_10m ?? "--"} <span className="text-[10px] font-normal text-slate-500">km/h</span></p>
        </div>
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-500">Humidity</p>
          <p className="mt-1 text-sm font-semibold text-slate-800">{current.relative_humidity_2m ?? "--"}<span className="text-[10px] font-normal text-slate-500">%</span></p>
        </div>
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-500">Precipitation</p>
          <p className="mt-1 text-sm font-semibold text-slate-800">{current.precipitation ?? "0"} <span className="text-[10px] font-normal text-slate-500">mm</span></p>
        </div>
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-500">Cloud cover</p>
          <p className="mt-1 text-sm font-semibold text-slate-800">{current.cloud_cover ?? "--"}<span className="text-[10px] font-normal text-slate-500">%</span></p>
        </div>
      </div>
    </motion.section>
  );
}

export default function WeatherDashboard({ city, data, unit }) {
  const weather = data.weather;
  const current = weather.current;
  const daily = weather.daily;
  const air = data.airQuality;

  return (
    <motion.div
      key={city.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div className="grid items-stretch gap-3 xl:grid-cols-[1fr_1fr]">
        <WeatherHero city={city} current={current} daily={daily} unit={unit} />
        <WeatherMap city={city} />
      </div>

      <WeatherInsights current={current} hourly={weather.hourly} daily={daily} airQuality={air} />

      <div className="grid gap-3 xl:grid-cols-[1.45fr_0.85fr]">
        <HourlyTemperatureChart hourly={weather.hourly} current={current} unit={unit} />
        <RainfallChart daily={daily} />
      </div>

      <div className="grid items-stretch gap-3 xl:grid-cols-[1fr_270px]">
        <WeeklyForecast daily={daily} unit={unit} />
        <AirQualityPanel airQuality={air} />
      </div>

      <p className="pb-1 text-center text-[10px] text-slate-500">
        Weather and air-quality data are provided by Open-Meteo. Forecasts may change.
      </p>
    </motion.div>
  );
}

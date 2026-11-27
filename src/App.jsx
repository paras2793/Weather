import { motion } from "motion/react";
import { CloudSun, MapPin, Search, Sparkles } from "lucide-react";
import Sidebar from "./components/Sidebar";
import WeatherBackground from "./components/WeatherBackground";
import WeatherDashboard from "./components/WeatherDashboard";
import useWeatherData from "./hooks/useWeatherData";
import useWeatherStore from "./store/weatherStore";

function LoadingDashboard() {
  return (
    <div className="space-y-4" aria-label="Loading weather dashboard" aria-busy="true">
      <div className="h-[390px] animate-pulse rounded-[24px] border border-slate-200 bg-white/75" />
      <div className="grid gap-5 xl:grid-cols-[1.45fr_0.8fr]">
        <div className="h-[300px] animate-pulse rounded-[24px] border border-slate-200 bg-white/75" />
        <div className="h-[300px] animate-pulse rounded-[24px] border border-slate-200 bg-white/75" />
      </div>
      <div className="h-[230px] animate-pulse rounded-[24px] border border-slate-200 bg-white/75" />
    </div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative flex min-h-[620px] items-center justify-center overflow-hidden rounded-[26px] border border-slate-200 bg-white/80 px-6 py-12 text-center shadow-sm backdrop-blur-xl"
    >
      <div className="pointer-events-none absolute -left-20 -top-24 h-72 w-72 rounded-full bg-cyan-300/[0.07] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-20 h-80 w-80 rounded-full bg-violet-400/[0.07] blur-3xl" />
      <div className="relative max-w-lg">
        <div className="relative mx-auto mb-8 flex h-32 w-32 items-center justify-center rounded-[34px] border border-cyan-100/10 bg-gradient-to-br from-sky-100 to-blue-50 shadow-lg shadow-sky-100">
          <CloudSun size={68} strokeWidth={1.2} className="text-sky-600" />
          <span className="absolute -right-2 -top-2 flex h-9 w-9 items-center justify-center rounded-xl border border-sky-100 bg-white text-amber-500">
            <Sparkles size={17} />
          </span>
        </div>
        <p className="section-kicker">Your personal weather station</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">A clearer view of your world.</h2>
        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-slate-600">
          Search for a city to explore current conditions, an interactive map, hourly trends, the 7-day forecast, and air quality.
        </p>
        <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-xs font-medium text-slate-600 ">
          <Search size={14} className="text-cyan-200" />
          Start with the location search
        </div>
        <div className="mt-8 flex items-center justify-center gap-2 text-[10px] text-slate-500">
          <MapPin size={12} />
          <span>Search any city around the world</span>
        </div>
      </div>
    </motion.div>
  );
}

function App() {
  const cities = useWeatherStore((state) => state.cities);
  const activeCity = useWeatherStore((state) => state.activeCity);
  const unit = useWeatherStore((state) => state.unit);
  const addCity = useWeatherStore((state) => state.addCity);
  const selectCity = useWeatherStore((state) => state.selectCity);
  const removeCity = useWeatherStore((state) => state.removeCity);
  const setUnit = useWeatherStore((state) => state.setUnit);

  const { data, loading, error, updatedAt } = useWeatherData(activeCity);
  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="aether-app relative isolate min-h-screen overflow-hidden text-slate-800">
      <WeatherBackground current={data?.weather?.current} />
      <div className="relative z-10 mx-auto min-h-screen max-w-[1800px] lg:flex">
        <Sidebar
          cities={cities}
          activeCity={activeCity}
          onAddCity={addCity}
          onSelectCity={selectCity}
          onRemoveCity={removeCity}
        />

        <main className="min-w-0 flex-1 px-4 py-4 sm:px-6 lg:px-8 lg:py-5">
          <header className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-slate-500">{today}</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-800 sm:text-[28px]">
                Weather overview
              </h1>
              <p className="mt-1 text-xs text-slate-500">
                {activeCity ? `A closer look at ${activeCity.name}` : "Your weather dashboard is ready"}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {updatedAt && data && (
                <span className="hidden items-center gap-2 text-[10px] text-slate-500 sm:flex">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                  Updated {updatedAt.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
                </span>
              )}
              <div className="flex items-center rounded-full border border-slate-200 bg-white/85 p-1 shadow-sm backdrop-blur-lg" role="group" aria-label="Temperature units">
                {[
                  { label: "°C", value: "C" },
                  { label: "°F", value: "F" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setUnit(option.value)}
                    aria-pressed={unit === option.value}
                    className={`min-w-10 rounded-full px-3 py-2 text-xs font-semibold transition ${
                      unit === option.value
                        ? "bg-sky-600 text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </header>

          {error && (
            <div role="alert" className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 backdrop-blur-md">
              {error}
            </div>
          )}

          {!activeCity ? (
            <EmptyState />
          ) : loading && !data ? (
            <LoadingDashboard />
          ) : data ? (
            <WeatherDashboard city={activeCity} data={data} unit={unit} />
          ) : (
            <div className="flex min-h-[320px] items-center justify-center rounded-[26px] border border-slate-200 bg-white/85 p-8 text-center shadow-sm backdrop-blur-xl">
              <div>
                <CloudSun size={38} className="mx-auto mb-4 text-slate-500" />
                <p className="text-lg font-semibold text-white">Weather is not available</p>
                <p className="mt-2 text-sm text-slate-400">Try selecting the city again or search for another location.</p>
              </div>
            </div>
          )}

          {loading && data && (
            <p className="mt-4 text-center text-[10px] text-slate-500">Refreshing forecast…</p>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
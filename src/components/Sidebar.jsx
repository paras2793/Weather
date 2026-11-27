import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  CloudSun,
  MapPin,
  Menu,
  Plus,
  Search,
  Trash2,
  Wind,
  X,
} from "lucide-react";
import { formatCityName, searchCities } from "../services/weatherApi";

function Sidebar({ cities, activeCity, onAddCity, onSelectCity, onRemoveCity }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const searchTerm = query.trim();

    if (searchTerm.length < 2) {
      setSuggestions([]);
      setSearchError("");
      setSearching(false);
      setShowSuggestions(false);
      return undefined;
    }

    const controller = new AbortController();
    setSuggestions([]);
    setSearching(true);
    setSearchError("");
    setShowSuggestions(true);
    const timeoutId = window.setTimeout(async () => {

      try {
        const results = await searchCities(searchTerm, controller.signal);
        if (!controller.signal.aborted) {
          setSuggestions(results);
          if (results.length === 0) {
            setSearchError("No city found. Try a city name such as Noida, Delhi or Mumbai.");
          }
        }
      } catch (error) {
        if (!controller.signal.aborted && error.name !== "AbortError") {
          setSearchError("Could not search locations. Check your connection and try again.");
          setSuggestions([]);
        }
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    }, 320);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [query]);

  function chooseCity(city) {
    onAddCity(city);
    setQuery("");
    setSuggestions([]);
    setSearchError("");
    setShowSuggestions(false);
    setMobileOpen(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const searchTerm = query.trim();
    if (searchTerm.length < 2 || searching) return;

    if (suggestions.length === 1) {
      chooseCity(suggestions[0]);
      return;
    }
    if (suggestions.length > 1) {
      setShowSuggestions(true);
      return;
    }

    setSearching(true);
    setSearchError("");
    try {
      const results = await searchCities(searchTerm);
      setSuggestions(results);
      setShowSuggestions(true);
      if (results.length === 0) {
        setSearchError("No city found. Try a city name such as Noida, Delhi or Mumbai.");
      } else if (results.length === 1) {
        chooseCity(results[0]);
      }
    } catch {
      setSearchError("Could not search locations. Please try again.");
    } finally {
      setSearching(false);
    }
  }

  const searchBox = (
    <div className="mt-6">
      <p className="mb-3 px-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
        Explore a location
      </p>
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center gap-2 aether-search-box px-3 py-3 transition focus-within:border-sky-300">
          <Search size={17} className="shrink-0 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            placeholder="Search city or region…"
            autoComplete="off"
            aria-label="Search for a city"
            aria-expanded={showSuggestions}
            className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="rounded-lg p-1 text-slate-500 transition hover:text-white"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {showSuggestions && query.trim().length >= 2 && (
          <div
            role="listbox"
            aria-label="Matching cities"
            className="aether-suggestion-list absolute left-0 right-0 top-full z-40 mt-2 max-h-[300px] overflow-y-auto rounded-2xl border p-1.5 shadow-xl shadow-slate-300/30"
          >
            {searching && (
              <p className="px-3 py-3 text-xs text-slate-400">Finding populated places…</p>
            )}
            {!searching && searchError && (
              <p className="px-3 py-3 text-xs leading-5 text-rose-600">{searchError}</p>
            )}
            {!searching && suggestions.length > 1 && (
              <p className="px-3 pb-2 pt-1 text-[9px] font-bold uppercase tracking-[0.15em] text-sky-700">
                Choose the correct location
              </p>
            )}
            {!searching && suggestions.map((city) => (
              <button
                key={city.id}
                type="button"
                role="option"
                aria-selected={activeCity?.id === city.id}
                onClick={() => chooseCity(city)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-200"
              >
                <MapPin size={15} className="shrink-0 text-cyan-200" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-slate-800">{city.name}</span>
                  <span className="block truncate text-[10px] text-slate-500">{formatCityName(city)}</span>
                </span>
                {city.countryCode === "IN" && (
                  <span className="rounded-full bg-sky-50 px-2 py-1 text-[9px] font-semibold text-sky-700">India</span>
                )}
                <Plus size={14} className="shrink-0 text-slate-500" />
              </button>
            ))}
            {!searching && suggestions.length > 1 && (
              <p className="px-3 pb-2 pt-1 text-[9px] text-slate-500">Results are ranked by exact name and your preferred country, but you choose the final location.</p>
            )}
          </div>
        )}
      </form>
      <p className="mt-2 px-1 text-[10px] leading-5 text-slate-500">
        City-level results only. Search “Noida” or “Noida, India” for the Uttar Pradesh location.
      </p>
    </div>
  );

  const savedLocations = (
    <div className="mt-6">
      <div className="flex items-center justify-between px-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Saved locations</p>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-400">{cities.length}</span>
      </div>

      <div className="mt-3 space-y-1.5">
        <AnimatePresence initial={false}>
          {cities.map((city) => {
            const selected = activeCity?.id === city.id;
            return (
              <motion.div
                key={city.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -12 }}
                className={`group flex items-center rounded-2xl border transition ${selected ? "border-sky-200 bg-sky-50" : "border-transparent hover:border-slate-200 hover:bg-slate-50"}`}
              >
                <button
                  type="button"
                  onClick={() => {
                    onSelectCity(city);
                    setMobileOpen(false);
                  }}
                  aria-pressed={selected}
                  className="flex min-w-0 flex-1 items-center gap-3 px-3 py-3 text-left"
                >
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${selected ? "bg-sky-100 text-sky-700" : "bg-slate-100 text-slate-500"}`}>
                    <MapPin size={16} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={`block truncate text-sm font-semibold ${selected ? "text-white" : "text-slate-700"}`}>{city.name}</span>
                    <span className="block truncate text-[10px] text-slate-500">{[city.admin1, city.country].filter(Boolean).join(", ")}</span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => onRemoveCity(city.id)}
                  aria-label={`Remove ${city.name}`}
                  className="mr-2 rounded-lg p-2 text-slate-600 opacity-0 transition hover:bg-rose-400/10 hover:text-rose-300 group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100"
                >
                  <Trash2 size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {cities.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-5 text-center">
            <MapPin size={18} className="mx-auto mb-2 text-slate-600" />
            <p className="text-xs font-medium text-slate-400">Your places will appear here</p>
            <p className="mt-1 text-[10px] text-slate-500">Search above to add your first city</p>
          </div>
        )}
      </div>
    </div>
  );

  const footer = (
    <div className="mt-auto pt-9">
      <div className="aether-sidebar-subtle rounded-2xl border p-4">
        <div className="flex items-center gap-2 text-sky-700">
          <Wind size={16} />
          <span className="text-xs font-semibold">Live weather data</span>
        </div>
        <p className="mt-2 text-[10px] leading-5 text-slate-500">Forecasts and air-quality readings powered by Open-Meteo.</p>
      </div>
      <p className="mt-5 px-1 text-[10px] text-slate-600">WEATHER · PERSONAL WEATHER STATION</p>
    </div>
  );

  const sidebarContent = (
    <>
      <div className="flex items-center gap-3 px-1">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-700 ring-1 ring-sky-200">
          <CloudSun size={25} strokeWidth={1.8} />
        </div>
        <div>
          <p className="text-lg font-bold tracking-[0.18em] text-slate-800">WEATHER</p>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">Weather, clearly.</p>
        </div>
      </div>
      {searchBox}
      {savedLocations}
      {footer}
    </>
  );

  return (
    <>
      <aside className="hidden min-h-screen w-[260px] shrink-0 flex-col border-r border-slate-200 bg-white/85 px-5 py-6 backdrop-blur-2xl lg:flex">
        {sidebarContent}
      </aside>

      <div className="aether-mobile-header border-b px-4 py-3 backdrop-blur-2xl lg:hidden">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label={mobileOpen ? "Close locations menu" : "Open locations menu"}
            aria-expanded={mobileOpen}
            className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-visible"
            >
              <div className="flex max-h-[70vh] flex-col overflow-y-auto pb-2 pt-4">
                {sidebarContent}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

export default Sidebar;

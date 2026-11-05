import { useEffect, useState } from "react";
import { motion } from "framer-motion";

function CityManager({
  cities,
  onSelectCity,
  onDeleteCity,
  city,
  setCity,
  onAddCity,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [hasSelectedPlace, setHasSelectedPlace] = useState(false);

  useEffect(() => {
    const searchText = city.trim();

    if (!isOpen || searchText.length < 1 || hasSelectedPlace) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSuggestions([]);
      setSearchError("");
      setIsSearching(false);
      return;
    }

    const controller = new AbortController();

    const timeoutId = setTimeout(async () => {
      try {
        setIsSearching(true);
        setSearchError("");

        let places = [];

        // Open-Meteo does not return results for a one-character search.
        // Photon is used for the first character, then Open-Meteo for longer searches.
        if (searchText.length === 1) {
          const photonUrl = new URL("https://photon.komoot.io/api/");
          photonUrl.searchParams.set("q", searchText);
          photonUrl.searchParams.set("limit", "10");

          const response = await fetch(photonUrl, {
            signal: controller.signal,
          });
          const data = await response.json();

          if (!response.ok) {
            throw new Error("Could not search for cities. Please try again.");
          }

          const cityTypes = ["city", "town", "village", "municipality", "hamlet"];

          places = (data.features || [])
            .filter((feature) => {
              const details = feature.properties || {};
              return (
                details.osm_key === "place" &&
                cityTypes.includes(details.osm_value)
              );
            })
            .map((feature) => {
              const details = feature.properties || {};
              return {
                id: details.osm_id || `${details.name}-${feature.geometry?.coordinates?.join(",")}`,
                name: details.name || details.city || details.town || details.village,
                admin1: details.state,
                country: details.country,
              };
            })
            .filter((place) => place.name);
        } else {
          const geocodingApiUrl = import.meta.env.VITE_GEOCODING_API;

          if (!geocodingApiUrl) {
            throw new Error("Check VITE_GEOCODING_API in your .env file.");
          }

          const geocodingUrl = new URL(geocodingApiUrl);
          geocodingUrl.searchParams.set("name", searchText);
          geocodingUrl.searchParams.set("count", "10");
          geocodingUrl.searchParams.set("language", "en");

          const response = await fetch(geocodingUrl, {
            signal: controller.signal,
          });
          const data = await response.json();

          if (!response.ok || data.error) {
            throw new Error("Could not search for cities. Please try again.");
          }

          places = data.results || [];
        }

        setSuggestions(places);
      } catch (error) {
        if (error.name !== "AbortError") {
          setSuggestions([]);
          setSearchError(error.message || "Could not search for cities.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsSearching(false);
        }
      }
    }, 350);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [city, isOpen, hasSelectedPlace]);

  const handleSelectCity = (place) => {
    const selectedCity = [place.name, place.admin1, place.country]
      .filter(Boolean)
      .join(", ");

    setCity(selectedCity);
    setHasSelectedPlace(true);
    setIsOpen(false);
    setSuggestions([]);
    setSearchError("");
  };

  return (
    <>
      <header className="flex flex-col gap-5 rounded-3xl bg-white p-6 sm:p-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Weather App
        </h1>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative min-w-0 flex-1">
            <input
              className="w-full min-w-0 rounded-full border border-slate-200 bg-slate-50 px-5 py-3 outline-none transition focus:border-slate-500"
              type="text"
              placeholder="Search any city in the world..."
              value={city}
              autoComplete="off"
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={isOpen}
              onChange={(e) => {
                setCity(e.target.value);
                setHasSelectedPlace(false);
                setIsSearching(true);
                setSuggestions([]);
                setSearchError("");
                setIsOpen(true);
              }}
              onFocus={() => {
                if (city.trim() && !hasSelectedPlace) {
                  setIsSearching(true);
                }
                setIsOpen(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();

                  if (isOpen && suggestions.length > 0) {
                    handleSelectCity(suggestions[0]);
                  } else if (hasSelectedPlace && !isSearching) {
                    setIsOpen(false);
                    onAddCity();
                  }
                }

                if (e.key === "Escape") {
                  setIsOpen(false);
                }
              }}
            />

            {isOpen && city.trim().length >= 1 && (
              <div className="absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
                {isSearching && (
                  <p className="px-5 py-3 text-sm text-slate-500">
                    Searching cities around the world...
                  </p>
                )}

                {!isSearching && searchError && (
                  <p className="px-5 py-3 text-sm text-red-600">
                    {searchError}
                  </p>
                )}

                {!isSearching && !searchError && suggestions.length === 0 && (
                  <p className="px-5 py-3 text-sm text-slate-500">
                    No city found.
                  </p>
                )}

                {suggestions.length > 0 && (
                  <ul className="max-h-60 overflow-y-auto py-1">
                    {suggestions.map((place) => (
                      <li
                        key={place.id || `${place.name}-${place.latitude}-${place.longitude}`}
                        onClick={() => handleSelectCity(place)}
                        className="cursor-pointer px-5 py-2.5 text-sm text-slate-700 transition hover:bg-slate-100"
                      >
                        <span className="block font-medium text-slate-800">
                          {place.name}
                        </span>
                        <span className="block text-xs text-slate-500">
                          {[place.admin1, place.country]
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              if (!hasSelectedPlace) {
                setIsOpen(true);
                return;
              }

              setIsOpen(false);
              onAddCity();
            }}
            className="rounded-full bg-slate-900 px-7 py-3 font-semibold text-white transition hover:bg-slate-700"
          >
            + Add City
          </button>
        </div>
      </header>

      <main className="min-h-[300px] p-5 sm:p-8">
        {cities.length > 0 ? (
          <ul className="space-y-4">
            {cities.map((item) => (
              <motion.li
                key={item}
                className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.9 }}
                transition={{
                  duration: 0.4,
                  scale: {
                    type: "spring",
                    visualDuration: 0.4,
                    bounce: 0.1,
                  },
                }}
              >
                <button
                  onClick={() => onSelectCity(item)}
                  className="flex flex-1 items-center gap-4 text-left"
                >
                  <span className="text-xl font-semibold text-slate-900 transition hover:text-indigo-600">
                    {item}
                  </span>
                </button>

                <button
                  onClick={() => onDeleteCity(item)}
                  className="rounded-full bg-red-50 px-5 py-2 font-semibold text-red-600 transition hover:bg-red-100"
                >
                  Delete
                </button>
              </motion.li>
            ))}
          </ul>
        ) : (
          <div className="flex min-h-[250px] items-center justify-center">
            <p className="text-lg text-slate-500">
              No cities added yet. Add a city to get started!
            </p>
          </div>
        )}
      </main>
    </>
  );
}

export default CityManager;
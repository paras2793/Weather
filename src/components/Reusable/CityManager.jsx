/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import citycalling from "./CityName";

function CityManager({
  cities,
  onSelectCity,
  onDeleteCity,
  city,
  setCity,
  onAddCity,
}) {
  const [open, setOpen] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [cityToDelete, setCityToDelete] = useState(null);
  const [allCities, setAllCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const search = city ?? "";

  useEffect(() => {
    const searchTerm = search.trim();

    if (searchTerm.length < 2) {
      setAllCities([]);
      setError("");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    const controller = new AbortController();

    const timeoutId = setTimeout(async () => {
      try {
        const data = await citycalling(searchTerm, controller.signal);

        let cityList = data;

        if (!Array.isArray(data)) {
          cityList = data?.data ?? data?.cities ?? [];
        }

        const cityNames = cityList
          .map((item) => typeof item === "string" ? item : item?.name)
          .filter((name) => typeof name === "string" && name.trim());

        setAllCities(cityNames);

      } catch (err) {
        if (err.name !== "AbortError") {
          setError("Unable to load cities.");
          setAllCities([]);
          console.error(err);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 400);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [search]);

  const filteredCities = allCities.filter((item) =>
    item.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <header className="flex flex-col gap-5 rounded-3xl bg-white p-6 sm:p-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Weather App
        </h1>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative min-w-0 flex-1">
            <input
              className="w-full rounded-full border border-slate-200 bg-slate-50 px-5 py-3 outline-none focus:border-slate-500"
              type="text"
              placeholder="Search any city in the world..."
              value={search}
              autoComplete="off"
              onChange={(e) => setCity(e.target.value)}
              onFocus={() => setOpen(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onAddCity();
                  setOpen(false);
                }
              }}
            />
            {open && search.trim() && (
              <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-60 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                {loading ? (
                  <p className="p-3 text-sm text-gray-500">
                    Loading cities...
                  </p>
                ) : error ? (
                  <p className="p-3 text-sm text-red-500">
                    {error}
                  </p>
                ) : filteredCities.length > 0 ? (
                  filteredCities.slice(0, 50).map((item, index) => (
                    <button
                      key={`${item}-${index}`}
                      type="button"
                      onClick={() => {
                        setCity(item);
                        setOpen(false);
                      }}
                      className="w-full rounded-full px-4 py-3 text-left hover:bg-slate-100"
                    >
                      {item}
                    </button>
                  ))
                ) : (
                  <p className="p-3 text-sm text-gray-500">
                    No cities found
                  </p>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              onAddCity();
              setOpen(false);
            }}
            className="rounded-full bg-slate-900 px-7 py-3 font-semibold text-white hover:bg-slate-700"
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
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-between rounded-2xl bg-white px-5 py-3 shadow-md"
              >
                <button
                  onClick={() => onSelectCity(item)}
                  className="flex flex-1 items-center text-left"
                >
                  <span className="text-xl font-semibold text-slate-900 hover:text-indigo-600">
                    {item}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setCityToDelete(item);
                    setShowDeletePopup(true);
                  }}
                  className="rounded-full bg-red-50 px-5 py-2 font-semibold text-red-600 hover:bg-red-100"
                >
                  Delete
                </button>
              </motion.li>
            ))}
          </ul>
        ) : (
          <div className="flex min-h-[250px] items-center justify-center">
            <p className="text-lg text-slate-500">
              No cities yet
            </p>
          </div>
        )}
      </main>

      {showDeletePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-3 text-xl font-bold text-slate-900">
              Delete City?
            </h2>

            <p className="mb-6 text-slate-500">
              Are you sure you want to delete
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeletePopup(false);
                  setCityToDelete(null);
                }}
                className="rounded-full bg-slate-100 px-5 py-2 font-semibold text-slate-700 hover:bg-slate-200"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  if (cityToDelete) onDeleteCity(cityToDelete);

                  setShowDeletePopup(false);
                  setCityToDelete(null);
                }}
                className="rounded-full bg-red-600 px-5 py-2 font-semibold text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CityManager;
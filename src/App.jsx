import { motion } from "framer-motion";
import { useState } from "react";
import "./App.css";
import WeatherApp from "./WeatherFullPage";

function App() {
  const [city, setCity] = useState("");
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);

  function addCity() {
    const newCity = city.trim();

    if (!newCity) return;

    const alreadyExists = cities.some(
      (item) => item.toLowerCase() === newCity.toLowerCase()
    );

    if (alreadyExists) {
      alert("City already exists!");
      return;
    }

    setCities((prev) => [...prev, newCity]);
    setCity("");
  }

  function deleteCity(cityName) {
    setCities((prev) =>
      prev.filter((item) => item !== cityName)
    );
  }

  if (selectedCity) {
    return (
      <div className="min-h-screen bg-slate-200 p-3 sm:p-6">
        <div className="mx-auto max-w-7xl  rounded-3xl">
          <button
            onClick={() => setSelectedCity(null)}
            className="mb-5 rounded-full bg-slate-900 px-6 py-3 font-semibold text-white hover:bg-slate-700"
          >
            ← Back To Cities
          </button>

          <WeatherApp
            key={selectedCity}
            initialCity={selectedCity}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-200 p-3 sm:p-6">
      <div className="mx-auto max-w-7xl rounded-3xl bg-slate-100 shadow-xl">
        <header className="flex flex-col gap-5 bg-white p-6 sm:p-8  rounded-3xl">
          <h1 className="text-3xl font-bold text-slate-900">
            Weather App
          </h1>

          <div className="flex flex-col gap-3 sm:flex-row">

            <input
              className="min-w-0 flex-1 rounded-full border border-slate-200 bg-slate-50 px-5 py-3 outline-none transition focus:border-slate-500"
              type="text"
              placeholder="Enter a city..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addCity();
              }}
            />

            <button
              type="button"
              onClick={addCity}
              className="rounded-full bg-slate-900 px-7 py-3 font-semibold text-white transition hover:bg-slate-700"
            >
              + Add City
            </button>
          </div>
        </header>
   
        <main className="min-h-[300px] p-5 sm:p-8">
          {cities.length > 0 && (
            <ul className="space-y-4">
              {cities.map((item) => (

                <motion.li
                  key={item}
                  className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{
                      duration: 0.4,
                      scale: { type: "spring", visualDuration: 0.4, bounce: 0.1 },
                  }}
                >
                  <button
                    onClick={() => setSelectedCity(item)}
                    className="flex flex-1 items-center gap-4 text-left"
                  >
                    <span className="text-xl font-semibold text-slate-900 transition hover:text-indigo-600">
                      {item}
                    </span>
                  </button>
                  <button
                    onClick={() => deleteCity(item)}
                    className="rounded-full bg-red-50 px-5 py-2 font-semibold text-red-600 transition hover:bg-red-100"
                  >
                    Delete
                  </button>
                </motion.li>
              ))}
            </ul>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
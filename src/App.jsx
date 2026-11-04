
import { useState } from "react";
import "./App.css";

import CityManager from "./components/Reusable/CityManager";
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
        <div className="mx-auto max-w-7xl rounded-3xl">
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

        <CityManager
          cities={cities}
          city={city}
          setCity={setCity}
          onAddCity={addCity}
          onSelectCity={setSelectedCity}
          onDeleteCity={deleteCity}
        />

      </div>
    </div>
  );
}

export default App;

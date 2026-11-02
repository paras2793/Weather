import { motion } from "motion/react"

const weatherConditions = {
  0: ["☀️", "Clear sky"],
  1: ["🌤️", "Mainly clear"],
  2: ["⛅", "Partly cloudy"],
  3: ["☁️", "Overcast"],
  45: ["🌫️", "Fog"],
  48: ["🌫️", "Fog"],
  51: ["🌦️", "Light drizzle"],
  53: ["🌦️", "Drizzle"],
  55: ["🌧️", "Heavy drizzle"],
  56: ["🌧️", "Freezing drizzle"],
  57: ["🌧️", "Heavy freezing drizzle"],
  61: ["🌧️", "Light rain"],
  63: ["🌧️", "Rain"],
  65: ["🌧️", "Heavy rain"],
  66: ["🌧️", "Freezing rain"],
  67: ["🌧️", "Heavy freezing rain"],
  71: ["🌨️", "Light snow"],
  73: ["❄️", "Snow"],
  75: ["❄️", "Heavy snow"],
  77: ["🌨️", "Snow grains"],
  80: ["🌦️", "Rain showers"],
  81: ["🌧️", "Heavy showers"],
  82: ["⛈️", "Violent showers"],
  85: ["🌨️", "Snow showers"],
  86: ["❄️", "Heavy snow showers"],
  95: ["⛈️", "Thunderstorm"],
  96: ["⛈️", "Thunderstorm with hail"],
  99: ["⛈️", "Heavy thunderstorm"],
};

function showTemperature(value, unit) {
  if (value == null) {
    return "--";
  }

  if (unit === "F") {
    return Math.round((value * 9) / 5 + 32);
  }

  return Math.round(value);
}

function WeatherCard({weather, unit }) {
  const condition = weatherConditions[weather?.condition] || ["", "Unknown"];

  return (
    <motion.div className="flex flex-1 flex-col items-start justify-center px-4 sm:px-6 lg:px-8"
    initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            transition={{
                duration: 0.4,
                scale: { type: "spring", visualDuration: 0.4, bounce: 0.3 },
            }}
           >
      

      <div className="my-2 flex h-48 w-full items-center justify-start ">
        <span className="select-none text-8xl leading-none" aria-hidden="true">
          {condition[0]}
        </span>
      </div>

      <p className="text-7xl font-light leading-none text-gray-900">
        {showTemperature(weather?.temperature, unit)}°{unit}
      </p>

      <p className="mt-6 text-lg font-medium text-gray-900">
        {weather ? condition[1] : "Current weather"}
      </p>

      <div className="mt-6 w-full border-t border-gray-200 pt-5">
        <p className="text-sm text-gray-500">
          {weather ? "Current conditions" : "Search for a city to see its current weather."}
        </p>
      </div>
    </motion.div>
  );
}

export default WeatherCard;
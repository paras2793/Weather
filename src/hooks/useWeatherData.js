import { useEffect, useState } from "react";
import { fetchWeatherForCity } from "../services/weatherApi";

export default function useWeatherData(city) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState(null);

  useEffect(() => {
    if (!city) {
      setData(null);
      setError("");
      setLoading(false);
      return undefined;
    }

    const controller = new AbortController();

    async function loadWeather() {
      setLoading(true);
      setError("");
      setData(null);

      try {
        const result = await fetchWeatherForCity(city, controller.signal);
        if (!controller.signal.aborted) {
          setData(result);
          setUpdatedAt(new Date());
        }
      } catch (requestError) {
        if (!controller.signal.aborted && requestError.name !== "AbortError") {
          setError(requestError.message || "Unable to load weather right now.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadWeather();
    return () => controller.abort();
  }, [city]);

  return { data, loading, error, updatedAt };
}
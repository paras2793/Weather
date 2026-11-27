import { create } from "zustand";
import { persist } from "zustand/middleware";

const useWeatherStore = create(
  persist(
    (set) => ({
      cities: [],
      activeCity: null,
      unit: "C",

      addCity: (city) =>
        set((state) => {
          const alreadySaved = state.cities.some((item) => item.id === city.id);
          const cities = alreadySaved
            ? state.cities
            : [city, ...state.cities];

          return { cities, activeCity: city };
        }),

      selectCity: (city) => set({ activeCity: city }),

      removeCity: (cityId) =>
        set((state) => {
          const cities = state.cities.filter((city) => city.id !== cityId);
          const activeCity =
            state.activeCity?.id === cityId
              ? (cities[0] ?? null)
              : state.activeCity;

          return { cities, activeCity };
        }),

      setUnit: (unit) => set({ unit }),
    }),
    {
      name: "aether-weather-preferences",
      partialize: (state) => ({
        cities: state.cities,
        activeCity: state.activeCity,
        unit: state.unit,
      }),
    },
  ),
);

export default useWeatherStore;

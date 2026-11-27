import test from "node:test";
import assert from "node:assert/strict";
import { buildWeatherInsights } from "../src/services/weatherInsights.js";

function baseWeather(overrides = {}) {
  return {
    current: {
      time: "2026-11-25T10:00",
      temperature_2m: 24,
      relative_humidity_2m: 55,
      wind_speed_10m: 12,
      ...overrides.current,
    },
    hourly: {
      time: Array.from({ length: 24 }, (_, index) => `2026-11-25T${String(10 + index).padStart(2, "0")}:00`),
      precipitation_probability: Array(24).fill(10),
      ...overrides.hourly,
    },
    daily: { uv_index_max: [3], ...overrides.daily },
    airQuality: overrides.airQuality === null
      ? null
      : { us_aqi: 35, ...(overrides.airQuality ?? {}) },
  };
}

test("returns an umbrella insight when rain probability reaches 60 percent", () => {
  const data = baseWeather({
    hourly: { precipitation_probability: [68, ...Array(23).fill(10)] },
  });
  const insights = buildWeatherInsights(data);
  assert.equal(insights[0].id, "rain");
  assert.match(insights[0].detail, /68%/);
});

test("returns a sun-protection insight for a very high UV forecast", () => {
  const insights = buildWeatherInsights(baseWeather({ daily: { uv_index_max: [9.2] } }));
  assert.ok(insights.some((item) => item.id === "uv"));
});

test("warns when US AQI is above 150", () => {
  const insights = buildWeatherInsights(baseWeather({ airQuality: { us_aqi: 171 } }));
  assert.ok(insights.some((item) => item.id === "air"));
});

test("does not call unknown air quality good", () => {
  const insights = buildWeatherInsights(baseWeather({ airQuality: null }));
  assert.equal(insights[0].id, "outdoors");
  assert.match(insights[0].detail, /Air quality is unavailable/);
});

test("returns no insights before current conditions are available", () => {
  assert.deepEqual(buildWeatherInsights({ current: null }), []);
});

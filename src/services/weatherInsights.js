function getUpcomingRainChance(hourly, current) {
  const times = hourly?.time ?? [];
  if (!times.length || !hourly?.precipitation_probability?.length) return null;

  let startIndex = times.findIndex((time) => time >= (current?.time ?? ""));
  if (startIndex < 0) startIndex = 0;

  const chances = hourly.precipitation_probability
    .slice(startIndex, startIndex + 12)
    .filter((value) => value != null)
    .map(Number);

  return chances.length ? Math.max(...chances) : null;
}

/**
 * Create short, deterministic tips from the actual weather and AQI response.
 * Each rule is deliberately visible and easy to adjust for learning.
 */
export function buildWeatherInsights({ current, hourly, daily, airQuality }) {
  if (!current) return [];

  const insights = [];
  const nextRainChance = getUpcomingRainChance(hourly, current);
  const windSpeed = Number(current.wind_speed_10m ?? 0);
  const humidity = Number(current.relative_humidity_2m ?? 0);
  const temperature = Number(current.temperature_2m ?? 0);
  const uvIndex = Number(daily?.uv_index_max?.[0] ?? 0);
  const aqi = airQuality?.us_aqi == null ? null : Number(airQuality.us_aqi);

  if (aqi != null && aqi > 150) {
    insights.push({
      id: "air",
      icon: "leaf",
      label: "Unhealthy air quality",
      detail: `US AQI is ${Math.round(aqi)}. Reduce prolonged or strenuous outdoor activity.`,
      tone: "rose",
    });
  }

  if (nextRainChance != null && nextRainChance >= 60) {
    insights.push({
      id: "rain",
      icon: "umbrella",
      label: "Umbrella recommended",
      detail: `Rain probability reaches ${Math.round(nextRainChance)}% in the next 12 hours.`,
      tone: "blue",
    });
  }

  if (uvIndex >= 8) {
    insights.push({
      id: "uv",
      icon: "sun",
      label: "Very high UV exposure",
      detail: `Today's maximum UV index is ${uvIndex.toFixed(1)}. Use sun protection outdoors.`,
      tone: "amber",
    });
  }

  if (windSpeed >= 30) {
    insights.push({
      id: "wind",
      icon: "wind",
      label: "Strong winds",
      detail: `Wind is around ${Math.round(windSpeed)} km/h. Be careful around exposed areas.`,
      tone: "violet",
    });
  }

  if (temperature >= 28 && humidity >= 85) {
    insights.push({
      id: "humidity",
      icon: "droplets",
      label: "Hot and humid",
      detail: "High humidity can make the air feel warmer. Drink water and take breaks.",
      tone: "cyan",
    });
  }

  if (insights.length === 0) {
    const isComfortable =
      temperature >= 18 &&
      temperature <= 30 &&
      windSpeed < 30 &&
      nextRainChance != null &&
      nextRainChance < 40 &&
      aqi != null &&
      aqi <= 100;

    insights.push({
      id: "outdoors",
      icon: isComfortable ? "check" : "cloud",
      label: isComfortable ? "A good window to get outside" : "No major weather alerts",
      detail: isComfortable
        ? "Temperature, wind, near-term rain and the available air-quality reading look favourable for outdoor plans."
        : aqi == null
          ? "No weather alert thresholds are currently triggered. Air quality is unavailable, so check local conditions before extended outdoor activity."
          : "Conditions are not crossing the AETHER alert thresholds right now. Check the forecast before heading out.",
      tone: "green",
    });
  }

  return insights.slice(0, 4);
}

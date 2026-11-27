const IMAGE_OPTIONS = "auto=format&fit=crop&w=2200&q=82";

const scenes = {
  "clear-day": {
    title: "Clear skies",
    image: "/backgrounds/clear-day.webp",
    fallback: "linear-gradient(125deg, #174b70 0%, #15314f 48%, #17223e 100%)",
    effect: "sun",
  },
  "clear-night": {
    title: "Clear night",
    image: `https://images.unsplash.com/photo-1519681393784-d120267933ba?${IMAGE_OPTIONS}`,
    fallback: "linear-gradient(135deg, #081329 0%, #182447 55%, #202744 100%)",
    effect: "stars",
  },
  "partly-day": {
    title: "Partly cloudy",
    image: `https://images.unsplash.com/photo-1499346030926-9a72daac6c63?${IMAGE_OPTIONS}`,
    fallback: "linear-gradient(135deg, #235a7d 0%, #293f60 55%, #24314c 100%)",
    effect: "clouds",
  },
  "partly-night": {
    title: "Clouds at night",
    image: `https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?${IMAGE_OPTIONS}`,
    fallback: "linear-gradient(135deg, #101a32 0%, #263653 58%, #172238 100%)",
    effect: "clouds",
  },
  "cloudy-day": {
    title: "Overcast skies",
    image: `https://images.unsplash.com/photo-1534088568595-a066f410bcda?${IMAGE_OPTIONS}`,
    fallback: "linear-gradient(135deg, #31475a 0%, #24384b 52%, #172537 100%)",
    effect: "clouds",
  },
  "cloudy-night": {
    title: "Cloudy night",
    image: `https://images.unsplash.com/photo-1500534623283-312aade485b7?${IMAGE_OPTIONS}`,
    fallback: "linear-gradient(135deg, #111a2e 0%, #28364a 55%, #0e1729 100%)",
    effect: "clouds",
  },
  rain: {
    title: "Rain in the area",
    image: `https://images.unsplash.com/photo-1519692933481-e162a57d6721?${IMAGE_OPTIONS}`,
    fallback: "linear-gradient(135deg, #172c43 0%, #1d3449 55%, #101d31 100%)",
    effect: "rain",
  },
  storm: {
    title: "Thunderstorm",
    image: `https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?${IMAGE_OPTIONS}`,
    fallback: "linear-gradient(135deg, #111827 0%, #273448 48%, #111827 100%)",
    effect: "storm",
  },
  fog: {
    title: "Misty conditions",
    image: `https://images.unsplash.com/photo-1485236715568-ddc5ee6ca227?${IMAGE_OPTIONS}`,
    fallback: "linear-gradient(135deg, #475569 0%, #334155 48%, #1e293b 100%)",
    effect: "fog",
  },
  snow: {
    title: "Snowfall",
    image: `https://images.unsplash.com/photo-1418985991508-e47386d96a71?${IMAGE_OPTIONS}`,
    fallback: "linear-gradient(135deg, #53677a 0%, #354b61 52%, #1e3448 100%)",
    effect: "snow",
  },
};

export function getWeatherScene(current) {
  const code = Number(current?.weather_code);
  const isDay = current?.is_day !== 0;

  let key = isDay ? "clear-day" : "clear-night";

  if ([95, 96, 99].includes(code)) key = "storm";
  else if ([71, 73, 75, 77, 85, 86].includes(code)) key = "snow";
  else if ([45, 48].includes(code)) key = "fog";
  else if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) key = "rain";
  else if (code === 3) key = isDay ? "cloudy-day" : "cloudy-night";
  else if ([1, 2].includes(code)) key = isDay ? "partly-day" : "partly-night";

  return { key, ...scenes[key] };
}
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CloudRain, TrendingUp } from "lucide-react";

function toDisplayTemperature(value, unit) {
  if (value == null || Number.isNaN(Number(value))) return null;
  return Math.round(unit === "F" ? (Number(value) * 9) / 5 + 32 : Number(value));
}

function ForecastTooltip({ active, payload, metric, unit }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  const details = {
    temperature: `${point.temperature}°${unit}`,
    rainChance: `${point.rainChance}%`,
    windSpeed: `${point.windSpeed} km/h`,
  };
  const labels = {
    temperature: "Temperature",
    rainChance: "Precipitation chance",
    windSpeed: "Wind speed",
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white/95 px-3 py-2 shadow-lg shadow-slate-300/30">
      <p className="text-[10px] font-medium text-slate-400">{point.fullTime}</p>
      <p className="mt-1 text-sm font-semibold text-white">{labels[metric]}</p>
      <p className="mt-0.5 text-base font-semibold text-sky-700">{details[metric]}</p>
    </div>
  );
}

function RainTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;

  return (
    <div className="rounded-xl border border-slate-200 bg-white/95 px-3 py-2 shadow-lg shadow-slate-300/30">
      <p className="text-[10px] font-medium text-slate-400">{point.day}</p>
      <p className="mt-1 text-sm font-semibold text-white">{point.rain} mm expected</p>
      <p className="mt-0.5 text-[10px] text-blue-700">{point.probability}% peak chance</p>
    </div>
  );
}

export function HourlyTemperatureChart({ hourly, current, unit }) {
  const [metric, setMetric] = useState("temperature");

  const chartData = useMemo(() => {
    const times = hourly?.time ?? [];
    if (!times.length) return [];

    const currentTime = current?.time ?? "";
    let startIndex = times.findIndex((time) => time >= currentTime);
    if (startIndex < 0) startIndex = 0;

    return times.slice(startIndex, startIndex + 24).map((time, index) => {
      const position = startIndex + index;
      const date = new Date(`${time}:00`);
      return {
        time,
        label: index === 0 ? "Now" : time.slice(11, 16),
        fullTime: date.toLocaleString(undefined, {
          weekday: "short",
          hour: "numeric",
          minute: "2-digit",
        }),
        temperature: toDisplayTemperature(hourly.temperature_2m?.[position], unit),
        rainChance: Math.round(hourly.precipitation_probability?.[position] ?? 0),
        windSpeed: Math.round(hourly.wind_speed_10m?.[position] ?? 0),
      };
    }).filter((item) => {
      if (metric === "temperature") return item.temperature != null;
      if (metric === "rainChance") return Number.isFinite(item.rainChance);
      return Number.isFinite(item.windSpeed);
    });
  }, [hourly, current, unit, metric]);

  const metricOptions = [
    { id: "temperature", label: "Temp", suffix: `°${unit}`, color: "#0ea5e9", dataKey: "temperature" },
    { id: "rainChance", label: "Rain", suffix: "%", color: "#3b82f6", dataKey: "rainChance" },
    { id: "windSpeed", label: "Wind", suffix: "km/h", color: "#8b5cf6", dataKey: "windSpeed" },
  ];
  const activeMetric = metricOptions.find((option) => option.id === metric) ?? metricOptions[0];

  return (
    <section className="glass-panel rounded-[24px] p-4 sm:p-5">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sky-700">
            <TrendingUp size={16} />
            <span className="section-kicker">Hourly outlook</span>
          </div>
          <h3 className="mt-1 text-lg font-semibold text-white">Next 24 hours</h3>
        </div>
        <div className="flex items-center rounded-full border border-slate-200 bg-slate-50 p-1" role="group" aria-label="Choose hourly chart metric">
          {metricOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setMetric(option.id)}
              aria-pressed={metric === option.id}
              className={`rounded-full px-3 py-1.5 text-[10px] font-semibold transition ${metric === option.id ? "bg-sky-100 text-sky-800" : "text-slate-500 hover:text-slate-800"}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {chartData.length > 0 ? (
        <div className="h-[230px] w-full" aria-label={`${activeMetric.label} forecast chart`}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 12, right: 8, left: -24, bottom: 0 }}>
              <defs>
                <linearGradient id="aetherForecastFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={activeMetric.color} stopOpacity={0.28} />
                  <stop offset="95%" stopColor={activeMetric.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#cbd5e1" strokeOpacity={0.7} vertical={false} />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                interval={3}
                tick={{ fill: "#8796aa", fontSize: 10 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#8796aa", fontSize: 10 }}
                tickFormatter={(value) => `${value}${activeMetric.suffix === "km/h" ? "" : activeMetric.suffix}`}
                domain={metric === "rainChance" ? [0, 100] : ["dataMin - 3", "dataMax + 3"]}
                width={42}
              />
              <Tooltip content={<ForecastTooltip metric={metric} unit={unit} />} cursor={{ stroke: activeMetric.color, strokeOpacity: 0.25 }} />
              <Area
                type="monotone"
                dataKey={activeMetric.dataKey}
                stroke={activeMetric.color}
                strokeWidth={2.5}
                fill="url(#aetherForecastFill)"
                activeDot={{ r: 5, stroke: "#ffffff", strokeWidth: 3, fill: activeMetric.color }}
                dot={false}
                isAnimationActive
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex h-[230px] items-center justify-center text-sm text-slate-500">Hourly forecast unavailable.</div>
      )}
      <p className="mt-2 text-[10px] text-slate-500">Select a metric to explore temperature, rain probability or wind speed.</p>
    </section>
  );
}

export function RainfallChart({ daily }) {
  const chartData = useMemo(() => {
    return (daily?.time ?? []).slice(0, 7).map((date, index) => ({
      day: index === 0
        ? "Today"
        : new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { weekday: "short" }),
      rain: Number((daily.precipitation_sum?.[index] ?? 0).toFixed(1)),
      probability: Math.round(daily.precipitation_probability_max?.[index] ?? 0),
    }));
  }, [daily]);

  return (
    <section className="glass-panel rounded-[24px] p-4 sm:p-5">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-300/10 text-blue-200">
          <CloudRain size={17} />
        </div>
        <div>
          <p className="section-kicker">Precipitation</p>
          <h3 className="text-lg font-semibold text-white">Rainfall outlook</h3>
        </div>
      </div>

      {chartData.length > 0 ? (
        <div className="h-[230px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 12, right: 0, left: -25, bottom: 0 }}>
              <CartesianGrid stroke="#cbd5e1" strokeOpacity={0.7} vertical={false} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#8796aa", fontSize: 10 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#8796aa", fontSize: 10 }} tickFormatter={(value) => `${value}`} width={34} />
              <Tooltip content={<RainTooltip />} cursor={{ fill: "#e2e8f0", fillOpacity: 0.55 }} />
              <Bar dataKey="rain" fill="#60a5fa" radius={[6, 6, 2, 2]} maxBarSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex h-[230px] items-center justify-center text-sm text-slate-500">Rainfall forecast unavailable.</div>
      )}
      <p className="mt-2 text-[10px] text-slate-500">Expected rainfall in millimetres (mm). Hover a bar for peak rain probability.</p>
    </section>
  );
}

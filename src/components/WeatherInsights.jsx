import { motion } from "motion/react";
import {
  CheckCircle2,
  CloudSun,
  Droplets,
  Leaf,
  Sun,
  Umbrella,
  Wind,
} from "lucide-react";
import { buildWeatherInsights } from "../services/weatherInsights";

const ICONS = {
  check: CheckCircle2,
  cloud: CloudSun,
  droplets: Droplets,
  leaf: Leaf,
  sun: Sun,
  umbrella: Umbrella,
  wind: Wind,
};

const toneClasses = {
  blue: "bg-blue-300/10 text-blue-200 ring-blue-200/10",
  amber: "bg-amber-300/10 text-amber-200 ring-amber-200/10",
  violet: "bg-violet-300/10 text-violet-200 ring-violet-200/10",
  cyan: "bg-cyan-300/10 text-cyan-200 ring-cyan-200/10",
  rose: "bg-rose-300/10 text-rose-200 ring-rose-200/10",
  green: "bg-emerald-300/10 text-emerald-200 ring-emerald-200/10",
};

export default function WeatherInsights({ current, hourly, daily, airQuality }) {
  const insights = buildWeatherInsights({ current, hourly, daily, airQuality });


}

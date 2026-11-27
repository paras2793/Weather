import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { getWeatherScene } from "../assets/weatherBackgrounds";

function BackgroundLayer({ scene }) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <motion.div
      className="weather-background-layer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.1, ease: "easeInOut" }}
      style={{ background: scene.fallback }}
      aria-hidden="true"
    >
      {!imageFailed && (
        <motion.img
          src={scene.image}
          alt=""
          className="weather-background-image"
          initial={{ scale: 1.035, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.9 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          onError={() => setImageFailed(true)}
          loading="eager"
          decoding="async"
        />
      )}
      <div className="weather-background-shade" />
      <div className={`weather-atmosphere atmosphere-${scene.effect}`} />
    </motion.div>
  );
}

export default function WeatherBackground({ current }) {
  const scene = getWeatherScene(current);

  return (
    <div className="weather-background" aria-hidden="true">
      <AnimatePresence mode="wait" initial={false}>
        <BackgroundLayer key={scene.key} scene={scene} />
      </AnimatePresence>
    </div>
  );
}

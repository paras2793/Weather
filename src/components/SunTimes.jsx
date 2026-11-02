import { motion } from "motion/react"

function formatTime(value) {
  if (!value) {
    return "--";
  }

  return new Date(value).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function SunTimes({ sunrise, sunset }) {
  return (
    <motion.div className="min-h-44 rounded-2xl bg-white p-5 shadow-md"            
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            transition={{
                duration: 0.6,
                scale: { type: "spring", visualDuration: 0.6, bounce: 0.3 },
            }}>
      <h3 className="mb-5 text-sm font-medium text-gray-500">Sunrise & Sunset</h3>
      <div className="flex items-center gap-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-xl text-amber-500" aria-hidden="true">↑</span>
        <div>
          <p className="text-lg font-medium text-gray-900">{formatTime(sunrise)}</p>
          <p className="text-xs text-gray-400">Sunrise</p>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-xl text-amber-500" aria-hidden="true">↓</span>
        <div>
          <p className="text-lg font-medium text-gray-900">{formatTime(sunset)}</p>
          <p className="text-xs text-gray-400">Sunset</p>
        </div>
      </div>
    </motion.div>
  );
}

export default SunTimes;

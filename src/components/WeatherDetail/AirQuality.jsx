import { motion } from "motion/react"

function getAQILabel(value) {
  if (value == null) return "Unavailable";
  if (value <= 50) return "Good";
  if (value <= 100) return "Moderate";
  if (value <= 150) return "Unhealthy for sensitive groups";
  if (value <= 200) return "Unhealthy";
  if (value <= 300) return "Very unhealthy";
  return "Hazardous";
}

function AirQuality({ value }) {
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
      <h3 className="mb-6 text-sm font-medium text-gray-500">Air Quality</h3>
      <p className="text-4xl font-light text-gray-900">
        {value ?? "--"}
      </p>
      <p className="mt-3 text-sm text-gray-500">{getAQILabel(value)}</p>
    </motion.div>
  );
}

export default AirQuality;

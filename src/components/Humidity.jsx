import { motion } from "motion/react"


function Humidity({ value }) {
  return (
    <motion.div className="min-h-44 rounded-2xl bg-white p-5 shadow-md"            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            transition={{
                duration: 0.6,
                scale: { type: "spring", visualDuration: 0.6, bounce: 0.3 },
            }}>
      <h3 className="mb-6 text-sm font-medium text-gray-500">Humidity</h3>
      <p className="text-4xl font-light text-gray-900">
        {value ?? "--"}<span className="ml-1 text-base font-normal tracking-normal">%</span>
      </p>
      <p className="mt-3 text-sm text-gray-400">Relative humidity</p>
    </motion.div>
  );
}

export default Humidity;

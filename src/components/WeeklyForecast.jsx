import { motion } from "motion/react";

function getDayName(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString + "T12:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "short",
  });
}

export default function WeeklyForecast({ dailyData, unit }) {
  if (!dailyData?.time) {
    return null;
  }

  const convertTemp = (temp) => {
    if (temp == null) return "--";

    return unit === "F"
      ? Math.round((temp * 9) / 5 + 32)
      : Math.round(temp);
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5 gap-3">
      {dailyData.time.slice(0, 10).map((date, index) => {
        const maxTemp = dailyData.temperature_2m_max?.[index];
        const minTemp = dailyData.temperature_2m_min?.[index];

        return (
          <motion.div
            key={date}
            className="rounded-2xl bg-white p-4 flex flex-col items-center gap-3 shadow-md transition-shadow hover:shadow-xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <p className="text-sm font-semibold text-gray-600">
              {index === 0 ? "Today" : getDayName(date)}
            </p>

            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">
                {convertTemp((maxTemp + minTemp) / 2)}°
              </p>

            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

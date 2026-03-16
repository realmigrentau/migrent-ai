import { useState } from "react";
import { Train, Clock, MapPin, ArrowRight } from "lucide-react";

interface Station {
  name: string;
  line: string;
  walk_min: number;
}

interface TransportCalculatorProps {
  suburbName: string;
  stations: Station[];
  transportScore: number | null;
}

const COMMON_DESTINATIONS = [
  { name: "Sydney CBD (Wynyard)", time_from_kellyville: 40 },
  { name: "Macquarie University", time_from_kellyville: 25 },
  { name: "Chatswood", time_from_kellyville: 25 },
  { name: "Parramatta", time_from_kellyville: 35 },
  { name: "UNSW (Kensington)", time_from_kellyville: 55 },
  { name: "Western Sydney University", time_from_kellyville: 45 },
];

export default function TransportCalculator({
  suburbName,
  stations,
  transportScore,
}: TransportCalculatorProps) {
  const [selectedDest, setSelectedDest] = useState(0);

  return (
    <section className="scroll-mt-8">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
        Transport & Commute
      </h2>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Nearest Stations */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
          <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <Train className="w-5 h-5 text-teal-500" />
            Nearest Stations
          </h3>
          <div className="space-y-3">
            {stations.map((station, i) => (
              <div
                key={station.name}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50"
              >
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {station.name} Station
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {station.line}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-sm font-medium text-teal-600 dark:text-teal-400">
                  <Clock className="w-3.5 h-3.5" />
                  {station.walk_min} min walk
                </div>
              </div>
            ))}
          </div>
          {transportScore && (
            <div className="mt-4 p-3 rounded-lg bg-teal-50 dark:bg-teal-900/20 text-center">
              <p className="text-sm text-teal-700 dark:text-teal-400">
                Transport Score:{" "}
                <span className="font-bold text-lg">{transportScore}/10</span>
              </p>
            </div>
          )}
        </div>

        {/* Commute Calculator */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
          <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-teal-500" />
            Commute Times from {suburbName}
          </h3>
          <div className="space-y-2">
            {COMMON_DESTINATIONS.map((dest, i) => (
              <button
                key={dest.name}
                onClick={() => setSelectedDest(i)}
                className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                  selectedDest === i
                    ? "bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-800"
                    : "hover:bg-slate-50 dark:hover:bg-slate-700/50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <ArrowRight
                    className={`w-4 h-4 ${
                      selectedDest === i
                        ? "text-teal-500"
                        : "text-slate-400"
                    }`}
                  />
                  <span
                    className={`text-sm ${
                      selectedDest === i
                        ? "font-medium text-teal-700 dark:text-teal-400"
                        : "text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {dest.name}
                  </span>
                </div>
                <span
                  className={`text-sm font-semibold ${
                    selectedDest === i
                      ? "text-teal-600 dark:text-teal-400"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  ~{dest.time_from_kellyville} min
                </span>
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-4">
            Times are approximate via public transport during peak hours
          </p>
        </div>
      </div>
    </section>
  );
}

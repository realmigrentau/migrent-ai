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
      <h2 className="text-2xl font-bold text-[var(--color-ink)] mb-6">
        Transport & Commute
      </h2>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Nearest Stations */}
        <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface-2)] p-6">
          <h3 className="font-semibold text-[var(--color-ink)] flex items-center gap-2 mb-4">
            <Train className="w-5 h-5 text-[var(--color-primary)]" />
            Nearest Stations
          </h3>
          <div className="space-y-3">
            {stations.map((station, i) => (
              <div
                key={station.name}
                className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-surface)] dark:bg-[var(--color-surface-muted)]/50"
              >
                <div>
                  <p className="font-medium text-[var(--color-ink)]">
                    {station.name} Station
                  </p>
                  <p className="text-sm text-[var(--color-ink-3)]">
                    {station.line}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-sm font-medium text-[var(--color-primary)] dark:text-[var(--color-primary)]">
                  <Clock className="w-3.5 h-3.5" />
                  {station.walk_min} min walk
                </div>
              </div>
            ))}
          </div>
          {transportScore && (
            <div className="mt-4 p-3 rounded-lg bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-50)] text-center">
              <p className="text-sm text-[var(--color-primary-700)] dark:text-[var(--color-primary)]">
                Transport Score:{" "}
                <span className="font-bold text-lg">{transportScore}/10</span>
              </p>
            </div>
          )}
        </div>

        {/* Commute Calculator */}
        <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface-2)] p-6">
          <h3 className="font-semibold text-[var(--color-ink)] flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-[var(--color-primary)]" />
            Commute Times from {suburbName}
          </h3>
          <div className="space-y-2">
            {COMMON_DESTINATIONS.map((dest, i) => (
              <button
                key={dest.name}
                onClick={() => setSelectedDest(i)}
                className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                  selectedDest === i
                    ? "bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-50)] border border-[var(--color-primary-100)] dark:border-[var(--color-line)]"
                    : "hover:bg-[var(--color-surface)] dark:hover:bg-[var(--color-surface-muted)]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <ArrowRight
                    className={`w-4 h-4 ${
                      selectedDest === i
                        ? "text-[var(--color-primary)]"
                        : "text-[var(--color-ink-3)]"
                    }`}
                  />
                  <span
                    className={`text-sm ${
                      selectedDest === i
                        ? "font-medium text-[var(--color-primary-700)] dark:text-[var(--color-primary)]"
                        : "text-[var(--color-ink-2)]"
                    }`}
                  >
                    {dest.name}
                  </span>
                </div>
                <span
                  className={`text-sm font-semibold ${
                    selectedDest === i
                      ? "text-[var(--color-primary)] dark:text-[var(--color-primary)]"
                      : "text-[var(--color-ink-3)]"
                  }`}
                >
                  ~{dest.time_from_kellyville} min
                </span>
              </button>
            ))}
          </div>
          <p className="text-xs text-[var(--color-ink-3)] mt-4">
            Times are approximate via public transport during peak hours
          </p>
        </div>
      </div>
    </section>
  );
}

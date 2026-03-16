import { MapPin, TrendingDown, Train } from "lucide-react";

interface Station {
  name: string;
  line: string;
  walk_min: number;
}

interface SuburbHeroProps {
  name: string;
  medianRent: number;
  vacancyRate: number;
  nearestStations: Station[];
  listingsCount: number;
}

export default function SuburbHero({
  name,
  medianRent,
  vacancyRate,
  nearestStations,
  listingsCount,
}: SuburbHeroProps) {
  const primaryStation = nearestStations[0];

  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-800 text-white">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative px-6 py-12 sm:px-10 sm:py-16 lg:px-16 lg:py-20">
        <div className="flex items-center gap-2 text-teal-200 text-sm font-medium mb-4">
          <MapPin className="w-4 h-4" />
          <span>Sydney, NSW</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
          {name} Rooms for Rent
        </h1>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-lg text-teal-100 mb-8">
          <span className="flex items-center gap-2">
            Median room: <strong className="text-white">${medianRent}/wk</strong>
          </span>
          <span className="hidden sm:inline text-teal-300">|</span>
          <span className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4" />
            {vacancyRate}% vacancy
          </span>
          {primaryStation && (
            <>
              <span className="hidden sm:inline text-teal-300">|</span>
              <span className="flex items-center gap-2">
                <Train className="w-4 h-4" />
                Near {primaryStation.name} Station
              </span>
            </>
          )}
        </div>

        <div className="flex flex-wrap gap-4">
          <a
            href="#listings"
            className="inline-flex items-center px-6 py-3 bg-white text-teal-700 font-semibold rounded-xl hover:bg-teal-50 transition-colors"
          >
            View {listingsCount} Available Rooms
          </a>
          <a
            href="#stats"
            className="inline-flex items-center px-6 py-3 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors"
          >
            Suburb Stats
          </a>
        </div>
      </div>
    </section>
  );
}

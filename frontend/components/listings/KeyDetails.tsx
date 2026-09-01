import { useEffect, useRef } from "react";
import {
  Wifi,
  Car,
  Snowflake,
  CheckCircle,
  XCircle,
  Train,
  Calendar,
  DollarSign,
  Bed,
  Bath,
  Users,
  Home,
  Dog,
  WashingMachine,
  UtensilsCrossed,
  Heart,
  Flame,
} from "lucide-react";
import GlassCard from "../ui/GlassCard";

interface KeyDetailsProps {
  listing: {
    weekly_price: number;
    bills_included?: boolean;
    furnished?: boolean;
    internet_included?: boolean;
    internet_speed?: string;
    parking?: boolean;
    air_conditioning?: boolean;
    laundry?: string;
    dishwasher?: boolean;
    pets_allowed?: boolean;
    pet_details?: string;
    couples_ok?: boolean;
    nearest_transport?: string;
    neighbourhood_vibe?: string;
    available_from?: string;
    available_to?: string;
    min_stay_weeks?: number;
    max_stay_weeks?: number;
    property_type?: string;
    place_type?: string;
    bedrooms?: number;
    bathrooms?: number;
    bathroom_type?: string;
    max_guests?: number;
    latitude?: number;
    longitude?: number;
    no_smoking?: boolean;
    quiet_hours?: string;
    tenant_prefs?: string;
    gender_preference?: string;
    security_cameras?: boolean;
    security_cameras_location?: string;
    other_safety_details?: string;
    highlights?: string[];
  };
}

function AmenityItem({
  icon: Icon,
  label,
  available,
  detail,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  available: boolean;
  detail?: string;
}) {
  return (
    <div className="flex items-center gap-2.5 py-2">
      <Icon
        className={`w-4.5 h-4.5 ${
          available
            ? "text-[var(--color-accent)]"
            : "text-[var(--color-ink-4)]"
        }`}
      />
      <span
        className={`text-sm ${
          available
            ? "text-[var(--color-ink-2)]"
            : "text-[var(--color-ink-3)] line-through"
        }`}
      >
        {label}
        {detail && available && (
          <span className="text-[var(--color-ink-3)] ml-1">
            ({detail})
          </span>
        )}
      </span>
    </div>
  );
}

export default function KeyDetails({ listing }: KeyDetailsProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  // Mini-map
  useEffect(() => {
    if (
      !mapContainer.current ||
      !listing.latitude ||
      !listing.longitude ||
      mapRef.current
    )
      return;

    const mapTilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY;
    if (!mapTilerKey) return;

    import("maplibre-gl").then((maplibregl) => {
      if (!mapContainer.current) return;
      const map = new maplibregl.default.Map({
        container: mapContainer.current,
        style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${mapTilerKey}`,
        center: [listing.longitude!, listing.latitude!],
        zoom: 14,
        interactive: false,
        attributionControl: false,
      });

      new maplibregl.default.Marker({ color: "#f43f5e" })
        .setLngLat([listing.longitude!, listing.latitude!])
        .addTo(map);

      mapRef.current = map;
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [listing.latitude, listing.longitude]);

  const weeklyTotal = listing.weekly_price;

  return (
    <div className="space-y-6">
      {/* Price card */}
      <GlassCard gradient="emerald" padding="md">
        <h3 className="text-sm font-semibold text-[var(--color-ink-3)] uppercase tracking-wide mb-3">
          <DollarSign className="w-4 h-4 inline -mt-0.5 mr-1" />
          Pricing
        </h3>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-black text-[var(--color-ink)]">
            ${weeklyTotal}
          </span>
          <span className="text-sm text-[var(--color-ink-3)]">
            / week
          </span>
        </div>
        <div className="mt-2 text-sm text-[var(--color-ink-2)]">
          {listing.bills_included ? (
            <span className="text-[var(--color-accent)] dark:text-[var(--color-accent)] font-medium">
              Bills included
            </span>
          ) : (
            <span>Bills not included - budget extra</span>
          )}
        </div>
      </GlassCard>

      {/* Property specs */}
      <GlassCard padding="md">
        <h3 className="text-sm font-semibold text-[var(--color-ink-3)] uppercase tracking-wide mb-3">
          Property
        </h3>
        <div className="flex flex-wrap gap-4 text-sm text-[var(--color-ink-2)]">
          {listing.property_type && (
            <div className="flex items-center gap-1.5">
              <Home className="w-4 h-4 text-[var(--color-ink-3)]" />
              {listing.property_type}
              {listing.place_type && ` - ${listing.place_type}`}
            </div>
          )}
          {listing.bedrooms != null && (
            <div className="flex items-center gap-1.5">
              <Bed className="w-4 h-4 text-[var(--color-ink-3)]" />
              {listing.bedrooms} bed{listing.bedrooms !== 1 ? "s" : ""}
            </div>
          )}
          {listing.bathrooms != null && (
            <div className="flex items-center gap-1.5">
              <Bath className="w-4 h-4 text-[var(--color-ink-3)]" />
              {listing.bathrooms} bath
              {listing.bathroom_type && ` (${listing.bathroom_type})`}
            </div>
          )}
          {listing.max_guests != null && (
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[var(--color-ink-3)]" />
              Max {listing.max_guests} guest
              {listing.max_guests !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      </GlassCard>

      {/* Highlights */}
      {listing.highlights && listing.highlights.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-[var(--color-ink-3)] uppercase tracking-wide mb-3">
            Highlights
          </h3>
          <div className="flex flex-wrap gap-2">
            {listing.highlights.map((h, i) => (
              <span
                key={i}
                className="text-xs font-medium px-3 py-1.5 rounded-full bg-[var(--color-accent-soft)] dark:bg-[var(--color-accent)]/10 text-[var(--color-accent)] dark:text-[var(--color-accent)]"
              >
                {h}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Amenities grid */}
      <GlassCard padding="md">
        <h3 className="text-sm font-semibold text-[var(--color-ink-3)] uppercase tracking-wide mb-2">
          Amenities
        </h3>
        <div className="grid grid-cols-2 gap-x-4">
          {listing.furnished !== undefined && (
            <AmenityItem
              icon={listing.furnished ? CheckCircle : XCircle}
              label={listing.furnished ? "Furnished" : "Unfurnished"}
              available={listing.furnished}
            />
          )}
          {listing.internet_included !== undefined && (
            <AmenityItem
              icon={Wifi}
              label={listing.internet_included ? "WiFi included" : "No WiFi"}
              available={listing.internet_included}
              detail={listing.internet_speed}
            />
          )}
          {listing.parking !== undefined && (
            <AmenityItem
              icon={Car}
              label={listing.parking ? "Parking" : "No parking"}
              available={listing.parking}
            />
          )}
          {listing.air_conditioning !== undefined && (
            <AmenityItem
              icon={Snowflake}
              label={listing.air_conditioning ? "A/C" : "No A/C"}
              available={listing.air_conditioning}
            />
          )}
          {listing.laundry && (
            <AmenityItem
              icon={WashingMachine}
              label={`Laundry (${listing.laundry})`}
              available={listing.laundry !== "none"}
            />
          )}
          {listing.dishwasher !== undefined && (
            <AmenityItem
              icon={UtensilsCrossed}
              label={listing.dishwasher ? "Dishwasher" : "No dishwasher"}
              available={listing.dishwasher}
            />
          )}
          {listing.pets_allowed !== undefined && (
            <AmenityItem
              icon={Dog}
              label={listing.pets_allowed ? "Pets allowed" : "No pets"}
              available={listing.pets_allowed}
              detail={listing.pet_details}
            />
          )}
          {listing.couples_ok !== undefined && (
            <AmenityItem
              icon={Heart}
              label={listing.couples_ok ? "Couples OK" : "No couples"}
              available={listing.couples_ok}
            />
          )}
          {listing.no_smoking !== undefined && (
            <AmenityItem
              icon={Flame}
              label={listing.no_smoking ? "No smoking" : "Smoking OK"}
              available={true}
            />
          )}
        </div>
      </GlassCard>

      {/* Availability */}
      {(listing.available_from || listing.min_stay_weeks) && (
        <GlassCard padding="md">
          <h3 className="text-sm font-semibold text-[var(--color-ink-3)] uppercase tracking-wide mb-3">
            <Calendar className="w-4 h-4 inline -mt-0.5 mr-1" />
            Availability
          </h3>
          <div className="space-y-2 text-sm text-[var(--color-ink-2)]">
            {listing.available_from && (
              <p>
                Available from{" "}
                <span className="font-medium text-[var(--color-ink)]">
                  {new Date(listing.available_from).toLocaleDateString(
                    "en-AU",
                    { day: "numeric", month: "short", year: "numeric" }
                  )}
                </span>
              </p>
            )}
            {listing.available_to && (
              <p>
                Until{" "}
                <span className="font-medium text-[var(--color-ink)]">
                  {new Date(listing.available_to).toLocaleDateString("en-AU", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </p>
            )}
            {listing.min_stay_weeks && (
              <p>
                Min stay: {listing.min_stay_weeks} week
                {listing.min_stay_weeks !== 1 ? "s" : ""}
              </p>
            )}
            {listing.max_stay_weeks && listing.max_stay_weeks < 52 && (
              <p>Max stay: {listing.max_stay_weeks} weeks</p>
            )}
          </div>
        </GlassCard>
      )}

      {/* Transport + map */}
      {(listing.nearest_transport ||
        (listing.latitude && listing.longitude)) && (
        <GlassCard padding="md">
          <h3 className="text-sm font-semibold text-[var(--color-ink-3)] uppercase tracking-wide mb-3">
            <Train className="w-4 h-4 inline -mt-0.5 mr-1" />
            Location
          </h3>
          {listing.nearest_transport && (
            <p className="text-sm text-[var(--color-ink-2)] mb-3">
              {listing.nearest_transport}
            </p>
          )}
          {listing.neighbourhood_vibe && (
            <p className="text-sm text-[var(--color-ink-3)] mb-3">
              Vibe: {listing.neighbourhood_vibe}
            </p>
          )}
          {listing.latitude && listing.longitude && (
            <div
              ref={mapContainer}
              className="w-full h-48 rounded-xl overflow-hidden bg-[var(--color-surface-muted)]"
            />
          )}
        </GlassCard>
      )}

      {/* House rules */}
      {(listing.quiet_hours ||
        listing.tenant_prefs ||
        listing.gender_preference ||
        listing.security_cameras ||
        listing.other_safety_details) && (
        <GlassCard padding="md">
          <h3 className="text-sm font-semibold text-[var(--color-ink-3)] uppercase tracking-wide mb-3">
            House Rules & Safety
          </h3>
          <ul className="space-y-2 text-sm text-[var(--color-ink-2)]">
            {listing.no_smoking && <li>No smoking on premises</li>}
            {listing.quiet_hours && (
              <li>Quiet hours: {listing.quiet_hours}</li>
            )}
            {listing.tenant_prefs && <li>{listing.tenant_prefs}</li>}
            {listing.gender_preference &&
              listing.gender_preference !== "any" && (
                <li>
                  Gender preference: {listing.gender_preference}
                </li>
              )}
            {listing.security_cameras && (
              <li>
                Security cameras on property
                {listing.security_cameras_location &&
                  `: ${listing.security_cameras_location}`}
              </li>
            )}
            {listing.other_safety_details && (
              <li>{listing.other_safety_details}</li>
            )}
          </ul>
        </GlassCard>
      )}
    </div>
  );
}

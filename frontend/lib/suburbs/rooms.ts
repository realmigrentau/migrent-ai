import type { PlaceSummary } from "./types";

/** The "Rooms for rent in <suburb>" page (pages/rooms/[state]/[slug].tsx). */
export function roomsHref(place: Pick<PlaceSummary, "state" | "slug">): string {
  return `/rooms/${place.state.toLowerCase()}/${place.slug}`;
}

import { siteIdentity } from "../lib/siteIdentity";

/**
 * Example listings (owner decision, 2026-11-15).
 *
 * While Migrent has only a handful of real rooms, the homepage and empty
 * searches show these so renters and hosts can see what a listing looks
 * like. They are not rooms anyone can rent, and nothing pretends they are:
 *
 *  - every title starts "Example listing:" (exampleListingTitle), the one
 *    label the owner asked for;
 *  - each has a suburb and never an address, and no host, so no "ID-checked
 *    host" badge;
 *  - they live only in this file, never in the database: no host accounts,
 *    no Apply, message, save, inspection or booking path, nothing in the
 *    admin panel or the numbers;
 *  - their pages (/example/[slug]) are noindex and left out of the sitemap;
 *  - they disappear once there are EXAMPLE_LISTINGS_HIDE_AT real listings,
 *    or at once when siteIdentity.launchScope.exampleListings is false.
 *
 * Photos are from Unsplash (free to use under the Unsplash License), chosen
 * as plain rooms rather than anyone's identifiable home.
 */

export const EXAMPLE_LISTINGS_HIDE_AT = 6;

export interface ExampleListing {
  slug: string;
  title: string;
  suburb: string;
  state: "NSW" | "VIC" | "QLD";
  weeklyRent: number;
  bondWeeks: number;
  placeType: "private_room" | "entire_place";
  billsIncluded: boolean;
  billsEstimateWeekly?: number;
  furnished: boolean;
  minStayMonths: number;
  household: string;
  description: string;
  features: string[];
  rules: string[];
  images: string[];
}

const photo = (id: string) => `https://images.unsplash.com/photo-${id}?w=1600&q=80&auto=format&fit=crop`;

export const EXAMPLE_LISTINGS: ExampleListing[] = [
  {
    slug: "parramatta-furnished-room",
    title: "Furnished room a short walk from Parramatta station",
    suburb: "Parramatta",
    state: "NSW",
    weeklyRent: 330,
    bondWeeks: 4,
    placeType: "private_room",
    billsIncluded: true,
    furnished: true,
    minStayMonths: 6,
    household: "Two other tenants, both working",
    description:
      "A furnished bedroom in a three-bedroom unit, about ten minutes on foot from the station and the shops. You share the kitchen, living room and laundry with two working tenants who keep the place tidy.",
    features: ["Wi-Fi and bills included", "Built-in wardrobe", "Desk and chair", "Shared laundry"],
    rules: ["No smoking inside", "Quiet after 10pm"],
    images: [photo("1522771739844-6a9f6d5f14af"), photo("1522708323590-d24dbb6b0267"), photo("1556911220-bff31c812dba")],
  },
  {
    slug: "strathfield-bright-room",
    title: "Bright room near Strathfield station",
    suburb: "Strathfield",
    state: "NSW",
    weeklyRent: 350,
    bondWeeks: 4,
    placeType: "private_room",
    billsIncluded: true,
    furnished: true,
    minStayMonths: 6,
    household: "A couple and one student",
    description:
      "A sunny bedroom with a large window in a quiet townhouse. The train to the city takes about fifteen minutes, and there are grocery stores and cafes close by.",
    features: ["Bills included", "Queen bed", "Shared kitchen", "Street parking"],
    rules: ["No smoking", "Guests by arrangement"],
    images: [photo("1556020685-ae41abfc9365"), photo("1493809842364-78817add7ffb"), photo("1484154218962-a197022b5858")],
  },
  {
    slug: "burwood-room-own-bathroom",
    title: "Room with its own bathroom in Burwood",
    suburb: "Burwood",
    state: "NSW",
    weeklyRent: 395,
    bondWeeks: 4,
    placeType: "private_room",
    billsIncluded: false,
    billsEstimateWeekly: 35,
    furnished: true,
    minStayMonths: 6,
    household: "Two professionals",
    description:
      "A large bedroom with its own bathroom in a modern apartment, close to Burwood station and the shopping centre. The living room and kitchen are shared.",
    features: ["Own bathroom", "Air conditioning", "Building lift", "Shared balcony"],
    rules: ["No smoking", "No pets", "Clean up after cooking"],
    images: [photo("1595526114035-0d45ed16cfbf"), photo("1567767292278-a4f21aa2d36e"), photo("1556911220-bff31c812dba")],
  },
  {
    slug: "auburn-quiet-room",
    title: "Quiet room in a family home in Auburn",
    suburb: "Auburn",
    state: "NSW",
    weeklyRent: 290,
    bondWeeks: 4,
    placeType: "private_room",
    billsIncluded: true,
    furnished: true,
    minStayMonths: 3,
    household: "A family of three",
    description:
      "A quiet bedroom at the back of a family home. The family is happy to help someone new to Sydney settle in, and the bus to the station stops at the end of the street.",
    features: ["Bills and Wi-Fi included", "Use of kitchen and laundry", "Backyard"],
    rules: ["No smoking", "Quiet after 9pm on weeknights"],
    images: [photo("1571508601891-ca5e7a713859"), photo("1502672260266-1c1ef2d93688"), photo("1484154218962-a197022b5858")],
  },
  {
    slug: "blacktown-granny-flat",
    title: "One-bedroom granny flat in Blacktown",
    suburb: "Blacktown",
    state: "NSW",
    weeklyRent: 440,
    bondWeeks: 4,
    placeType: "entire_place",
    billsIncluded: false,
    billsEstimateWeekly: 40,
    furnished: false,
    minStayMonths: 12,
    household: "Just you (the owners live in the main house)",
    description:
      "A self-contained granny flat with its own entrance, kitchen and bathroom. It suits a couple or one person who wants their own space, about ten minutes by bus from Blacktown station.",
    features: ["Own kitchen and bathroom", "Own entrance", "Off-street parking", "Split-system air conditioning"],
    rules: ["No smoking", "Pets considered"],
    images: [photo("1540518614846-7eded433c457"), photo("1560448204-e02f11c3d0e2"), photo("1617806118233-18e1de247200")],
  },
  {
    slug: "carlton-room-near-university",
    title: "Room near the University of Melbourne",
    suburb: "Carlton",
    state: "VIC",
    weeklyRent: 360,
    bondWeeks: 4,
    placeType: "private_room",
    billsIncluded: true,
    furnished: true,
    minStayMonths: 6,
    household: "Three students",
    description:
      "A furnished bedroom in a student share house, a short walk from the university and Lygon Street. Trams to the city run every few minutes.",
    features: ["Bills and Wi-Fi included", "Study desk", "Shared kitchen", "Bike storage"],
    rules: ["No smoking", "Shared cleaning roster"],
    images: [photo("1631049307264-da0ec9d70304"), photo("1513694203232-719a280e022f"), photo("1556911220-bff31c812dba")],
  },
  {
    slug: "box-hill-private-room",
    title: "Private room close to Box Hill station",
    suburb: "Box Hill",
    state: "VIC",
    weeklyRent: 310,
    bondWeeks: 4,
    placeType: "private_room",
    billsIncluded: true,
    furnished: true,
    minStayMonths: 6,
    household: "One working professional",
    description:
      "A comfortable bedroom in a two-bedroom apartment near Box Hill station and Box Hill Central. You share the apartment with one quiet professional.",
    features: ["Bills included", "Heating and cooling", "Building gym", "Secure entry"],
    rules: ["No smoking", "No overnight guests on weeknights"],
    images: [photo("1505693416388-ac5ce068fe85"), photo("1586023492125-27b2c045efd7"), photo("1484154218962-a197022b5858")],
  },
  {
    slug: "sunnybank-share-house",
    title: "Room in a share house in Sunnybank",
    suburb: "Sunnybank",
    state: "QLD",
    weeklyRent: 260,
    bondWeeks: 4,
    placeType: "private_room",
    billsIncluded: true,
    furnished: true,
    minStayMonths: 3,
    household: "Two students",
    description:
      "A bedroom in a relaxed share house close to Sunnybank Plaza and buses to the city and universities. The house has a big kitchen and a covered outdoor area.",
    features: ["Bills and Wi-Fi included", "Ceiling fans", "Shared outdoor area", "Laundry"],
    rules: ["No smoking inside", "Keep shared areas tidy"],
    images: [photo("1616594039964-ae9021a400a0"), photo("1560185007-cde436f6a4d0"), photo("1617806118233-18e1de247200")],
  },
];

/** The one label the owner asked for, and the only title an example ever shows. */
export function exampleListingTitle(e: Pick<ExampleListing, "title">): string {
  return `Example listing: ${e.title}`;
}

export function exampleListingHref(e: Pick<ExampleListing, "slug">): string {
  return `/example/${e.slug}`;
}

export function getExampleListing(slug: string): ExampleListing | undefined {
  return EXAMPLE_LISTINGS.find((e) => e.slug === slug);
}

/** Show examples only while switched on and the real catalogue is small. */
export function showExampleListings(realListingCount: number | null | undefined): boolean {
  if (!siteIdentity.launchScope.exampleListings) return false;
  if (realListingCount == null) return false;
  return realListingCount < EXAMPLE_LISTINGS_HIDE_AT;
}

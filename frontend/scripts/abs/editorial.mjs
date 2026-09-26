/**
 * The sixteen hand-written suburb guides, migrated onto SAL codes.
 *
 * These are the only places on the site with opinions. Everything else a
 * suburb page shows is a number with a source; this file is a person saying
 * "the food on Haldon Street is the reason to live here", which no dataset
 * will ever tell you. That is worth keeping, so it is kept - but kept apart,
 * rendered in its own section, and stamped with the date a human last read it.
 *
 * What was removed on the way across, and why:
 *
 *  - Every commute time ("direct train to CBD in 40min", "about 15 minutes to
 *    Parramatta"). We have no routing engine and no licensed journey-planner
 *    feed, so these were guesses with a number attached.
 *  - Every safety claim ("Safe, family-friendly neighbourhood"). The old
 *    safety score had no methodology and has been removed; the prose version
 *    of the same unsourced claim goes with it.
 *  - Every vacancy claim ("Brisbane's vacancy is tight"). MigRent listing
 *    availability is not a suburb vacancy rate and we never had one.
 *  - Census figures quoted inline ("median age 32", "six in ten residents").
 *    Not because they were wrong - they check out against the 2021 Census -
 *    but because the page now prints the real figure with its source directly
 *    above, and a hand-typed copy can only drift.
 *
 * The rent adjectives ("genuinely affordable", "some of the cheapest rooms in
 * Sydney") are kept. They are comparative editorial judgements rather than
 * statistics, they sit under an "Editorial" heading that says so, and the
 * Census median rent for the suburb is shown on the same page.
 */

/** The date a human last read every entry in this file end to end. */
export const EDITORIAL_REVIEWED_ON = "2026-09-26";

/**
 * Keyed by SAL code, which is the only identifier that survives a rename.
 * `legacySlug` is what the old single-segment URL used, and drives the
 * redirects from /suburb/<slug> to the new collision-safe path.
 */
export const EDITORIAL = {
  10107: {
    legacySlug: "auburn",
    summary:
      "Auburn is one of Sydney's most multicultural suburbs, home to large Chinese, Nepalese, Indian and Turkish communities. It sits on the western rail line with connections to Parramatta and the city.",
    loves: [
      "Among the more affordable suburbs this close to Parramatta",
      "Deeply multicultural - large Chinese, Nepalese, Turkish and Indian communities",
      "Auburn Botanic Gardens, and some of Sydney's best cheap eats",
    ],
    thingsToKnow: [
      "Fewer nightlife options than the inner city",
      "Busy arterial roads around the town centre",
    ],
    transportNote: "Auburn Station is served by the T1 Western and T2 Leppington and Inner West lines.",
  },

  10181: {
    legacySlug: "bankstown",
    summary:
      "Bankstown is south-west Sydney's big multicultural centre - home to one of Australia's largest Vietnamese communities plus strong Lebanese, Chinese, Pakistani and Bangladeshi communities.",
    loves: [
      "One of Australia's largest Vietnamese communities - unbeatable pho and banh mi",
      "Genuinely affordable rooms for a centre this size",
      "A full town centre, so most errands can be done without leaving the suburb",
    ],
    thingsToKnow: [
      "Bankstown Station is closed for its conversion to Sydney Metro, with replacement buses running until it reopens as Metro M1",
      "The town centre is busy and traffic-heavy",
    ],
    transportNote:
      "Bankstown Station is being converted to Sydney Metro (M1). Check Transport for NSW for the current reopening date and replacement bus routes.",
  },

  10396: {
    legacySlug: "blacktown",
    summary:
      "Blacktown is one of Sydney's largest suburbs and a major western hub, with big Indian and Filipino communities and a full-sized town centre built around its station.",
    loves: [
      "Affordable rooms with a full-sized town centre attached",
      "Large Indian and Filipino communities - familiar groceries, churches and temples",
      "A T1 and T5 junction, with direct trains to Parramatta and the city",
    ],
    thingsToKnow: [
      "Well west of the coast and the inner city",
      "Car-oriented streets once you are away from the centre",
    ],
    transportNote: "Blacktown Station is a junction of the T1 Western and T5 Cumberland lines.",
  },

  11971: {
    legacySlug: "hurstville",
    summary:
      "Hurstville is the hub of Sydney's south, with a major train station and a busy shopping strip. Its large Chinese and Nepalese communities mean familiar groceries, languages and food are everywhere.",
    loves: [
      "The hub of Sydney's south - a major shopping strip and express trains",
      "Large Chinese and Nepalese communities with familiar groceries everywhere",
      "Almost everything is walkable from the station",
    ],
    thingsToKnow: [
      "The town centre is dense and busy on weekends",
      "Apartment living dominates near the station",
    ],
    transportNote: "Hurstville Station is on the T4 Eastern Suburbs and Illawarra line, including express services.",
  },

  12096: {
    legacySlug: "kellyville",
    summary:
      "Kellyville is a fast-growing suburb in the Hills District of Sydney, popular with families and recent migrants. The Metro North West line gives it a direct rail connection while it keeps a suburban feel of modern estates and parks.",
    loves: [
      "Kellyville and Rouse Hill Metro stations on the doorstep",
      "New estates with modern, well-maintained rooms",
      "A strong Indian and South Asian community, with groceries to match",
      "Family-friendly, with schools and parks close by",
    ],
    thingsToKnow: [
      "Peak-hour Metro services can be crowded",
      "Limited nightlife and entertainment",
      "A car is helpful for some errands",
      "A long way from the beaches",
    ],
    transportNote: "Kellyville and Rouse Hill are on the Metro North West line to Chatswood.",
  },

  12164: {
    legacySlug: "kingsford",
    summary:
      "Kingsford sits at UNSW's doorstep at the end of the L3 light rail. A large share of residents were born overseas, and Anzac Parade carries some of Sydney's best Indonesian, Malaysian and Chinese food.",
    loves: [
      "Walking distance to UNSW - the classic international-student suburb",
      "L3 light rail straight to Central",
      "The Anzac Parade food strip",
    ],
    thingsToKnow: [
      "Room demand spikes at the start of every UNSW semester, so start looking early",
      "No heavy rail - light rail and buses only",
    ],
    transportNote: "The L3 Kingsford light rail line terminates in the suburb and runs to Central.",
  },

  12266: {
    legacySlug: "lakemba",
    summary:
      "Lakemba is one of Sydney's most affordable and most multicultural suburbs - the heart of the Bangladeshi community, with strong Indian, Pakistani and Burmese communities and the Ramadan night markets on Haldon Street.",
    loves: [
      "Some of the cheapest rooms in Sydney",
      "The heart of the Bangladeshi community - Haldon Street's food and the Ramadan night markets",
      "A young, community-minded suburb",
    ],
    thingsToKnow: [
      "Lakemba Station is closed for its conversion to Sydney Metro, with replacement buses running until it reopens as Metro M1",
      "Fewer jobs locally - most residents commute",
    ],
    transportNote:
      "Lakemba Station is being converted to Sydney Metro (M1). Check Transport for NSW for the current reopening date and replacement bus routes.",
  },

  12514: {
    legacySlug: "marrickville",
    summary:
      "Marrickville is the inner west's share-house heartland, known for its Vietnamese and Greek roots, live music and converted warehouses. It sits close to the University of Sydney and the airport line.",
    loves: [
      "The inner west's share-house heartland - live music and warehouse venues",
      "Vietnamese and Greek food institutions",
      "Close to the University of Sydney",
    ],
    thingsToKnow: [
      "Under the flight path - expect aircraft noise",
      "Marrickville Station is closed for its conversion to Sydney Metro, with replacement buses running until it reopens as Metro M1",
    ],
    transportNote:
      "Marrickville Station is being converted to Sydney Metro (M1). Check Transport for NSW for the current reopening date and replacement bus routes.",
  },

  12969: {
    legacySlug: "newtown",
    summary:
      "Newtown is the inner west's cultural main street - King Street's cafes, bookshops, live venues and late-night food run the length of the suburb. It sits between the University of Sydney and the airport line, which keeps share-house demand high.",
    loves: [
      "King Street - one of Sydney's best strips for food, music and op shops",
      "Walk or one stop to the University of Sydney",
      "Legendary share-house culture, so housemates are easy to find",
    ],
    thingsToKnow: [
      "Inner west prices - rooms cost more than further west",
      "King Street noise if you live close to the strip",
    ],
    transportNote: "Newtown Station is on the T2 Inner West and Leppington line, a short walk from King Street.",
  },

  13167: {
    legacySlug: "parramatta",
    summary:
      "Parramatta is western Sydney's second CBD, with Western Sydney University nearby and direct trains to the city. A large majority of residents were born overseas, including one of Australia's largest Indian communities.",
    loves: [
      "Western Sydney's second CBD - jobs, shops and Westfield on your doorstep",
      "Direct trains to Central, with Metro West under construction",
      "One of Australia's largest Indian communities - familiar food and festivals",
    ],
    thingsToKnow: [
      "CBD bustle - high-rise living rather than quiet streets",
      "Rents are climbing as new towers go up",
    ],
    transportNote: "Parramatta Station is served by the T1 Western and T5 Cumberland lines.",
  },

  13690: {
    legacySlug: "strathfield",
    summary:
      "Strathfield is a major rail junction with a young, student-heavy population and strong Nepalese, Chinese and Korean communities. Its share houses and unit blocks make it a common first stop for new arrivals.",
    loves: [
      "A major rail junction - three train lines meet here",
      "Student-friendly share houses and unit blocks",
      "A strong Korean, Nepalese and Chinese food scene",
    ],
    thingsToKnow: [
      "Rents run higher than neighbouring suburbs further west",
      "Train noise near the junction",
    ],
    transportNote: "Strathfield Station is served by the T1, T2 and T9 lines.",
  },

  32694: {
    legacySlug: "sunnybank",
    summary:
      "Sunnybank is Brisbane's Chinese and Taiwanese heart - Market Square and Sunnybank Plaza hold some of Australia's best Asian food courts.",
    loves: [
      "Australia-famous Asian food courts at Market Square and Sunnybank Plaza",
      "Big Chinese and Taiwanese communities - familiar groceries everywhere",
      "Quieter suburban streets with genuinely affordable rooms",
    ],
    thingsToKnow: [
      "Car-oriented - the station is a walk from the main centres",
      "Fewer nightlife options than inner Brisbane",
    ],
    transportNote: "Sunnybank Station is on the Beenleigh line; most locals also rely on buses.",
  },

  33033: {
    legacySlug: "west-end",
    summary:
      "West End is Brisbane's riverside cultural pocket - markets, Greek heritage, and the CityCat ferry across to the university precincts. Leafy streets, apartments along the river, and a strong cafe scene.",
    loves: [
      "Riverside location with CityCat ferries and CityGlider buses",
      "Davies Park Market and the Boundary Street food scene",
      "Close to South Bank, QUT and UQ across the river",
    ],
    thingsToKnow: [
      "Parts of the suburb flooded in 2022 - check a listing's street before signing",
      "Rooms near the river go quickly",
    ],
    transportNote: "The West End ferry terminal is served by CityCat, with CityGlider buses along Boundary Street.",
  },

  20361: {
    legacySlug: "brunswick",
    summary:
      "Brunswick is Melbourne's creative north - Sydney Road's live venues, vintage shops and cafes, with the Upfield line and bike path running its length. Italian and Greek roots, young share-house energy.",
    loves: [
      "Sydney Road - live music, vintage shops and one of Melbourne's best food strips",
      "The Upfield bike path runs the length of the suburb",
      "A strong share-house culture",
    ],
    thingsToKnow: [
      "Pricier than the western suburbs",
      "Sydney Road traffic and tram-hour crowds",
    ],
    transportNote: "The Upfield line and the Route 19 tram both run through Brunswick.",
  },

  20495: {
    legacySlug: "carlton",
    summary:
      "Carlton is Melbourne's university quarter - Lygon Street's Italian heritage strip beside the University of Melbourne, with a young international population and big Chinese, Indian and Malaysian student communities.",
    loves: [
      "Walk to the University of Melbourne and RMIT",
      "Lygon Street - the original Italian food strip, plus great Asian eats",
      "A genuinely international suburb",
    ],
    thingsToKnow: [
      "Student demand keeps rooms competitive around semester start",
      "Apartment towers dominate - houses are rare and pricey",
    ],
    transportNote: "Swanston Street trams run to the CBD; most of Carlton is a short walk from the university.",
  },

  20935: {
    legacySlug: "footscray",
    summary:
      "Footscray is Melbourne's inner west crossroads - famous Vietnamese and East African food, a major rail junction, and some of the inner city's most affordable rooms.",
    loves: [
      "Some of inner Melbourne's cheapest rooms",
      "Footscray Market, plus Vietnamese and East African food institutions",
      "A major rail junction on the Sunbury, Werribee and Williamstown lines",
    ],
    thingsToKnow: [
      "Still has rough edges around the station at night",
      "Construction everywhere as the suburb redevelops",
    ],
    transportNote: "Footscray Station is served by the Sunbury, Werribee and Williamstown lines, plus V/Line services.",
  },
};

/** Legacy single-segment slug -> SAL code, for the redirects. */
export const LEGACY_SLUGS = Object.fromEntries(
  Object.entries(EDITORIAL).map(([salCode, e]) => [e.legacySlug, salCode]),
);

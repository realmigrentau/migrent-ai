/**
 * Rental law by state (/guides/rental-laws).
 *
 * Every figure here was checked against the state or territory's official
 * source on LAST_CHECKED (MIGRENT_MASTER_AUDIT MIG-035): the government
 * renting page, the standard tenancy agreement or the Act itself, listed in
 * `sources` for each state. Claims that could not be checked were removed
 * rather than kept. It is general information, still to be confirmed by a
 * lawyer or a tenants' advice service, and the page says so.
 *
 * When tenancy law changes, update the figure, its source and LAST_CHECKED
 * together.
 */

export const LAST_CHECKED = "2 October 2026";

export interface Source {
  label: string;
  url: string;
}

export interface StateRentalLaw {
  code: string;
  name: string;
  bondRules: string[];
  rentRules: string[];
  entryRules: string[];
  /** Renting a room in a home where the owner lives (boarders and lodgers). */
  roomInHome: string[];
  disputeProcess: string[];
  migrantInfo: string[];
  emergencyContact: string;
  /** The official renting page. lib/listingCosts.ts links the same one. */
  fairTradingUrl: string;
  sources: Source[];
}

const ROOM_IN_HOME_GENERAL =
  "If you rent a room in a home where the owner (or the main tenant) also lives, you may be a boarder or lodger rather than a tenant, and some or all of the rules on this page may not apply to you. Ask the official renting service below or a tenants' advice service before you pay a bond.";

const NEW_ARRIVALS = [
  "Your rights as a renter do not depend on your visa.",
  "Treating you differently because of your race, nationality or ethnic origin is against the law everywhere in Australia.",
  "Free interpreting is available from TIS National on 131 450.",
  "Never pay rent or a bond before you have inspected the home and signed an agreement.",
];

const states: StateRentalLaw[] = [
  {
    code: "NSW",
    name: "New South Wales",
    bondRules: [
      "The bond can be at most 4 weeks' rent.",
      "It goes to NSW Fair Trading (Rental Bonds Online), not the landlord: within 10 working days of being paid, or, if paid to an agent, within 10 working days after the end of that month.",
    ],
    rentRules: [
      "A landlord can ask for at most 2 weeks' rent in advance.",
      "Rent can go up at most once in any 12 months, and only with at least 60 days' written notice.",
    ],
    entryRules: [
      "Inspections need at least 7 days' written notice, and there can be no more than 4 in any 12 months.",
      "Entry to carry out or check repairs needs at least 2 days' notice.",
    ],
    roomInHome: [ROOM_IN_HOME_GENERAL],
    disputeProcess: [
      "1. Raise the problem with the landlord or agent in writing.",
      "2. Ask NSW Fair Trading for free help to resolve it (13 32 20).",
      "3. If it is not resolved, apply to the NSW Civil and Administrative Tribunal (NCAT), whose orders are binding.",
    ],
    migrantInfo: [...NEW_ARRIVALS, "Free tenancy advice: the Tenants' Union of NSW and local Tenants' Advice and Advocacy Services."],
    emergencyContact: "NSW Fair Trading: 13 32 20",
    fairTradingUrl: "https://www.fairtrading.nsw.gov.au/housing-and-property/renting",
    sources: [
      { label: "NSW standard residential tenancy agreement (updated 21 September 2026)", url: "https://www.nsw.gov.au/sites/default/files/noindex/2025-06/residential-tenancy-agreement-form.pdf" },
      { label: "NSW Government: paying a rental bond", url: "https://www.nsw.gov.au/housing-and-construction/renting-a-place-to-live/renting-a-property-nsw/starting-a-lease/paying-a-rental-bond" },
    ],
  },
  {
    code: "VIC",
    name: "Victoria",
    bondRules: [
      "In most cases the bond can be at most one month's rent. It can be more only if the rent is over $900 a week or VCAT has set a higher bond.",
      "The rental provider must lodge it with the Residential Tenancies Bond Authority (RTBA) within 14 days of receiving it.",
    ],
    rentRules: [
      "At most one month's rent in advance, or 14 days' rent if rent is paid weekly. There is no limit when the rent is over $900 a week.",
      "Rent can go up at most once every 12 months (for agreements from 19 June 2019), with at least 90 days' notice.",
    ],
    entryRules: [
      "General inspections need at least 7 days' notice and can happen at most once every 6 months.",
      "Entry for repairs or the rental provider's other legal duties needs at least 24 hours' notice.",
    ],
    roomInHome: [ROOM_IN_HOME_GENERAL, "Rooming houses (rooms rented to several unrelated people) have their own rules in Victoria."],
    disputeProcess: [
      "1. Raise the problem with the rental provider or agent in writing.",
      "2. Ask Consumer Affairs Victoria for advice (1300 558 181).",
      "3. If it is not resolved, apply to the Victorian Civil and Administrative Tribunal (VCAT), whose orders are binding.",
    ],
    migrantInfo: [...NEW_ARRIVALS, "Free tenancy advice: Tenants Victoria."],
    emergencyContact: "Consumer Affairs Victoria: 1300 558 181",
    fairTradingUrl: "https://www.consumer.vic.gov.au/housing/renting",
    sources: [
      { label: "Consumer Affairs Victoria: bond amounts and payments", url: "https://www.consumer.vic.gov.au/housing/renting/rent-bond-bills-and-condition-reports/bond/bond-amounts-and-paying-a-bond" },
      { label: "Consumer Affairs Victoria: lodging the bond with the RTBA", url: "https://www.consumer.vic.gov.au/housing/renting/rent-bond-bills-and-condition-reports/bond/lodging-the-bond-with-the-rtba" },
      { label: "Consumer Affairs Victoria: rent payments and rent in advance", url: "https://www.consumer.vic.gov.au/housing/renting/rent-bond-bills-and-condition-reports/rent/rent-payments-and-rent-in-advance" },
      { label: "Consumer Affairs Victoria: rent increases", url: "https://www.consumer.vic.gov.au/housing/renting/rent-bond-bills-and-condition-reports/rent/rent-increases" },
      { label: "Consumer Affairs Victoria: when a rental provider can enter", url: "https://www.consumer.vic.gov.au/housing/renting/rental-providers-inspecting-or-entering-a-property/when-a-rental-provider-can-enter-a-property" },
    ],
  },
  {
    code: "QLD",
    name: "Queensland",
    bondRules: [
      "The bond can be at most 4 weeks' rent, for houses, units and rooming accommodation alike.",
      "The property manager or owner must give you a receipt and lodge it with the Residential Tenancies Authority (RTA) within 10 days.",
    ],
    rentRules: [
      "At the start, at most 2 weeks' rent in advance for a periodic agreement or rooming accommodation, or 1 month for a fixed-term agreement.",
      "Rent can only go up once at least 12 months have passed since the last increase, even under a new agreement or a new owner.",
    ],
    entryRules: [
      "Routine inspections need at least 7 days' notice (an Entry notice, Form 9) and can happen at most once every 3 months.",
      "Entry for repairs or maintenance needs at least 48 hours' notice.",
    ],
    roomInHome: [
      "If the owner lives in the home and rents out 1 to 3 rooms and takes a bond, only the rules on bonds apply: it still goes to the RTA within 10 days.",
      "If they rent out 1 to 3 rooms and take no bond, the rental law may not apply at all.",
      "If they rent out 4 or more rooms, or a self-contained second dwelling, the law applies in full.",
    ],
    disputeProcess: [
      "1. Raise the problem with the property manager or owner in writing.",
      "2. Ask the RTA for its free dispute resolution service (1300 366 311).",
      "3. If it is not resolved, apply to the Queensland Civil and Administrative Tribunal (QCAT), whose orders are binding.",
    ],
    migrantInfo: [...NEW_ARRIVALS, "Free tenancy advice: Tenants Queensland."],
    emergencyContact: "Residential Tenancies Authority: 1300 366 311",
    fairTradingUrl: "https://www.rta.qld.gov.au",
    sources: [
      { label: "RTA: rental bond", url: "https://www.rta.qld.gov.au/starting-a-tenancy/rental-bond" },
      { label: "RTA: rent increases", url: "https://www.rta.qld.gov.au/rent" },
      { label: "RTA: entry to the property", url: "https://www.rta.qld.gov.au/during-a-tenancy/living-in-the-property/entry-to-the-property" },
      { label: "RTA: owner-occupiers renting out rooms (3 March 2025)", url: "https://www.rta.qld.gov.au/news/2025/03/03/owner-occupiers-renting-out-rooms" },
    ],
  },
  {
    code: "WA",
    name: "Western Australia",
    bondRules: [
      "The bond can be at most 4 weeks' rent, unless the rent is over $1,200 a week.",
      "A pet bond of up to $350 can be added if you have a pet.",
      "Bonds must be lodged with Bonds Administration within 14 days of being paid.",
    ],
    rentRules: [
      "At most 2 weeks' rent in advance.",
      "Rent can go up at most once every 12 months, with at least 60 days' written notice.",
    ],
    entryRules: ["Routine inspections need 7 to 14 days' written notice, and there can be no more than 4 in 12 months."],
    roomInHome: [ROOM_IN_HOME_GENERAL],
    disputeProcess: [
      "1. Raise the problem with the landlord or property manager in writing.",
      "2. Ask Consumer Protection for advice (1300 30 40 54).",
      "3. If it is not resolved, apply to the Magistrates Court, whose orders are binding.",
    ],
    migrantInfo: [...NEW_ARRIVALS, "Free tenancy advice: Circle Green Community Legal."],
    emergencyContact: "Consumer Protection WA: 1300 30 40 54",
    fairTradingUrl: "https://www.commerce.wa.gov.au/consumer-protection/renting-home",
    sources: [
      { label: "Consumer Protection WA: rental bonds", url: "https://www.consumerprotection.wa.gov.au/rental-bonds" },
      { label: "Consumer Protection WA: rent increases", url: "https://www.consumerprotection.wa.gov.au/rent-increases" },
      { label: "Consumer Protection WA: rent inspections and privacy", url: "https://www.consumerprotection.wa.gov.au/rent-inspections-and-privacy-rights" },
    ],
  },
  {
    code: "SA",
    name: "South Australia",
    bondRules: [
      "For agreements from 1 April 2023, the bond can be at most 4 weeks' rent when the rent is $800 a week or less, and 6 weeks' rent above that.",
      "It must be lodged with Consumer and Business Services within 2 weeks (registered agents have 4 weeks).",
    ],
    rentRules: [
      "At the start, a landlord can ask only for the bond and at most 2 weeks' rent in advance.",
      "Rent cannot go up within 12 months of the start of the tenancy or of the last increase, and needs at least 60 days' written notice.",
    ],
    entryRules: ["Inspections can happen at most 4 times a year, with 7 to 28 days' written notice."],
    roomInHome: [ROOM_IN_HOME_GENERAL, "Rooming houses have their own rules in South Australia."],
    disputeProcess: [
      "1. Raise the problem with the landlord or agent in writing.",
      "2. Ask Consumer and Business Services for advice (131 882).",
      "3. If it is not resolved, apply to the South Australian Civil and Administrative Tribunal (SACAT), whose orders are binding.",
    ],
    migrantInfo: [...NEW_ARRIVALS, "Free tenancy advice: the Tenants' Information and Advocacy Service."],
    emergencyContact: "Consumer and Business Services: 131 882",
    fairTradingUrl: "https://www.cbs.sa.gov.au/renting",
    sources: [
      { label: "Law Handbook (Legal Services Commission of SA): bonds", url: "https://www.lawhandbook.sa.gov.au/ch23s01s05s01.php" },
      { label: "Law Handbook: rent", url: "https://www.lawhandbook.sa.gov.au/ch23s01s06s05.php" },
      { label: "Law Handbook: the landlord's right of entry", url: "https://www.lawhandbook.sa.gov.au/ch23s01s06s01.php" },
    ],
  },
  {
    code: "TAS",
    name: "Tasmania",
    bondRules: [
      "The bond can be at most 4 weeks' rent.",
      "It is held by the Rental Deposit Authority. Agents must lodge it within 10 working days of receiving it.",
    ],
    rentRules: [
      "A landlord can ask for rent in advance only for the first rent period. If you pay weekly, that is one week.",
      "Rent can go up only with at least 60 days' written notice, and not within 12 months of the start or renewal of the lease or of the last increase.",
    ],
    entryRules: ["Routine inspections need at least 24 hours' notice, between 8am and 6pm, and can happen at most once every 3 months."],
    roomInHome: [ROOM_IN_HOME_GENERAL],
    disputeProcess: [
      "1. Raise the problem with the owner or agent in writing.",
      "2. Ask Consumer, Building and Occupational Services (CBOS) for advice (1300 654 499).",
      "3. Bond disputes go to the Residential Tenancy Commissioner; other disputes can go to the Magistrates Court.",
    ],
    migrantInfo: [...NEW_ARRIVALS, "Free tenancy advice: the Tenants' Union of Tasmania."],
    emergencyContact: "CBOS Tasmania: 1300 654 499",
    fairTradingUrl: "https://www.cbos.tas.gov.au/topics/housing/renting",
    sources: [
      { label: "Residential Tenancy Act 1997 (Tas), sections 17, 20 and 25", url: "https://www.legislation.tas.gov.au/view/whole/html/inforce/current/act-1997-082" },
      { label: "CBOS: privacy and access", url: "https://cbos.tas.gov.au/topics/housing/renting/during-a-tenancylease/privacy-access" },
    ],
  },
  {
    code: "ACT",
    name: "Australian Capital Territory",
    bondRules: [
      "The bond can be at most 4 weeks' rent.",
      "It goes to the ACT Office of Rental Bonds within 2 weeks of being received or of the tenancy starting, whichever is later (4 weeks if an agent lodges it).",
    ],
    rentRules: [
      "At most 2 weeks' rent in advance, unless you choose to pay more.",
      "Rent cannot go up more often than every 12 months, and needs 8 weeks' written notice.",
    ],
    entryRules: ["Routine inspections can happen twice in 12 months (as well as at the start and end), with 1 week's written notice."],
    roomInHome: [ROOM_IN_HOME_GENERAL],
    disputeProcess: [
      "1. Raise the problem with the lessor or agent in writing.",
      "2. Ask Access Canberra for information (13 22 81).",
      "3. If it is not resolved, apply to the ACT Civil and Administrative Tribunal (ACAT), whose orders are binding.",
    ],
    migrantInfo: [...NEW_ARRIVALS, "Free tenancy advice: the Tenants' Advice Service at Canberra Community Law."],
    emergencyContact: "Access Canberra: 13 22 81",
    fairTradingUrl: "https://www.accesscanberra.act.gov.au/s/article/renting-tab-overview",
    sources: [
      { label: "ACT standard residential tenancy terms (Residential Tenancies Act 1997, schedule 1)", url: "https://www.act.gov.au/__data/assets/pdf_file/0006/2614443/Standard-residential-tenancy-terms-Sch-1.pdf" },
      { label: "ACT Revenue Office: about rental bonds", url: "https://www.revenue.act.gov.au/rental-bonds/about-rental-bonds" },
    ],
  },
  {
    code: "NT",
    name: "Northern Territory",
    bondRules: [
      "The security deposit (bond) can be at most 4 weeks' rent.",
      "There is no government bond authority: the landlord holds it in trust for you and returns it at the end, less any proper claims.",
    ],
    rentRules: [
      "A landlord can ask for at most one rent period in advance before the first period ends. If you pay weekly, that is one week.",
      "Rent can go up only if the agreement allows it, with at least 30 days' written notice, and not within 6 months of the start or of the last increase.",
    ],
    entryRules: ["Inspections must be arranged at least 7 days ahead, between 7am and 9pm, and at least 3 months apart."],
    roomInHome: [ROOM_IN_HOME_GENERAL],
    disputeProcess: [
      "1. Raise the problem with the landlord or agent in writing.",
      "2. Ask NT Consumer Affairs for advice (1800 019 319).",
      "3. If it is not resolved, apply to the Northern Territory Civil and Administrative Tribunal (NTCAT), whose orders are binding.",
    ],
    migrantInfo: [...NEW_ARRIVALS, "Free tenancy advice: Darwin Community Legal Service."],
    emergencyContact: "NT Consumer Affairs: 1800 019 319",
    fairTradingUrl: "https://nt.gov.au/property/renters",
    sources: [
      { label: "Residential Tenancies Act 1999 (NT), sections 29, 39, 41 and 70 (in force at 1 August 2025)", url: "https://legislation.nt.gov.au/api/sitecore/Act/PDF?id=12173" },
      { label: "NT Government: security deposits and bonds", url: "https://nt.gov.au/property/private-renters/find-out-about-rental-costs/security-deposits-bonds" },
    ],
  },
];

export function getAllStates(): StateRentalLaw[] {
  return states;
}

export function getStateByCode(code: string): StateRentalLaw | undefined {
  return states.find((s) => s.code.toUpperCase() === code.toUpperCase());
}

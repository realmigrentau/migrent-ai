export interface SuburbData {
  name: string;
  avgRent: { single: number; double: number; ensuite: number; studio: number }; // weekly rent in $
  medianPropertyValue: number;
}

const suburbs: SuburbData[] = [
  {
    name: "Bondi",
    avgRent: { single: 380, double: 480, ensuite: 520, studio: 550 },
    medianPropertyValue: 2150000,
  },
  {
    name: "Surry Hills",
    avgRent: { single: 370, double: 470, ensuite: 510, studio: 540 },
    medianPropertyValue: 1850000,
  },
  {
    name: "Newtown",
    avgRent: { single: 340, double: 430, ensuite: 470, studio: 500 },
    medianPropertyValue: 1650000,
  },
  {
    name: "Parramatta",
    avgRent: { single: 270, double: 350, ensuite: 390, studio: 420 },
    medianPropertyValue: 980000,
  },
  {
    name: "Chatswood",
    avgRent: { single: 310, double: 400, ensuite: 440, studio: 470 },
    medianPropertyValue: 1450000,
  },
  {
    name: "Hurstville",
    avgRent: { single: 260, double: 340, ensuite: 370, studio: 400 },
    medianPropertyValue: 1150000,
  },
  {
    name: "Strathfield",
    avgRent: { single: 280, double: 360, ensuite: 400, studio: 430 },
    medianPropertyValue: 1350000,
  },
  {
    name: "Bankstown",
    avgRent: { single: 240, double: 310, ensuite: 340, studio: 370 },
    medianPropertyValue: 880000,
  },
  {
    name: "Liverpool",
    avgRent: { single: 230, double: 300, ensuite: 330, studio: 350 },
    medianPropertyValue: 780000,
  },
  {
    name: "Blacktown",
    avgRent: { single: 220, double: 290, ensuite: 320, studio: 340 },
    medianPropertyValue: 750000,
  },
  {
    name: "Penrith",
    avgRent: { single: 210, double: 280, ensuite: 310, studio: 330 },
    medianPropertyValue: 720000,
  },
  {
    name: "Manly",
    avgRent: { single: 390, double: 490, ensuite: 530, studio: 570 },
    medianPropertyValue: 2350000,
  },
  {
    name: "Randwick",
    avgRent: { single: 350, double: 450, ensuite: 490, studio: 520 },
    medianPropertyValue: 1950000,
  },
  {
    name: "Redfern",
    avgRent: { single: 350, double: 440, ensuite: 480, studio: 510 },
    medianPropertyValue: 1550000,
  },
  {
    name: "Marrickville",
    avgRent: { single: 320, double: 410, ensuite: 450, studio: 480 },
    medianPropertyValue: 1450000,
  },
  {
    name: "Burwood",
    avgRent: { single: 290, double: 370, ensuite: 410, studio: 440 },
    medianPropertyValue: 1250000,
  },
  {
    name: "Homebush",
    avgRent: { single: 270, double: 350, ensuite: 380, studio: 410 },
    medianPropertyValue: 1050000,
  },
  {
    name: "Ashfield",
    avgRent: { single: 300, double: 380, ensuite: 420, studio: 450 },
    medianPropertyValue: 1300000,
  },
];

export function getAllSuburbs(): SuburbData[] {
  return suburbs;
}

export function getSuburbByName(name: string): SuburbData | undefined {
  return suburbs.find(
    (s) => s.name.toLowerCase() === name.toLowerCase()
  );
}

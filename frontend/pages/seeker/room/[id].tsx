import { useRouter } from "next/router";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../../hooks/useAuth";
import ReportModal from "../../../components/ReportModal";

const ROOMS: Record<string, any> = {
  "1": {
    id: "1",
    title: "Bright room near Central Station",
    address: "12 Crown St",
    suburb: "Surry Hills",
    postcode: "2010",
    weeklyPrice: 250,
    bond: "4 weeks rent (AUD $1,000)",
    minStay: "3 months",
    propertyType: "Apartment",
    placeType: "Private room",
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    bathroomType: "shared",
    maxGuests: 1,
    furnished: true,
    billsIncluded: true,
    highlights: ["5 min walk to Central", "Fully furnished", "Natural light", "Friendly housemates"],
    weeklyDiscount: null,
    monthlyDiscount: 5,
    whoElseLivesHere: "Two other tenants",
    totalOtherPeople: "2",
    description:
      "Bright and spacious private room in a friendly 3-bedroom sharehouse. The room gets plenty of natural light and comes fully furnished with a queen bed, desk, and wardrobe. Shared kitchen and bathroom are well-maintained. Great for students or young professionals.",
    amenities: ["WiFi included", "Washing machine", "Fully equipped kitchen", "Living room", "Balcony", "Air conditioning"],
    houseRules: ["No smoking inside", "Quiet hours 10pm-7am", "No pets", "Keep shared spaces tidy", "Guests welcome (notify housemates)"],
    transport: ["Central Station — 5 min walk", "Bus stop Crown St — 1 min walk", "Light rail Surry Hills — 8 min walk"],
    safety: { securityCameras: false, securityCamerasLocation: "", weaponsOnProperty: false, weaponsExplanation: "", otherSafetyDetails: "" },
    owner: { name: "Sarah M.", bio: "Local Surry Hills owner. I live nearby and keep the property well maintained.", verified: true, responseTime: "Usually within 2 hours" },
    photos: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=400&h=300&fit=crop",
    ],
  },
  "2": {
    id: "2",
    title: "Affordable share near USYD",
    address: "45 George St",
    suburb: "Redfern",
    postcode: "2016",
    weeklyPrice: 220,
    bond: "2 weeks rent (AUD $440)",
    minStay: "1 month",
    propertyType: "House",
    placeType: "Shared room",
    bedrooms: 1,
    beds: 2,
    bathrooms: 1,
    bathroomType: "shared",
    maxGuests: 2,
    furnished: true,
    billsIncluded: false,
    highlights: ["Close to USYD", "Quiet neighbourhood", "Near parks", "Budget-friendly"],
    weeklyDiscount: null,
    monthlyDiscount: null,
    whoElseLivesHere: "One other tenant",
    totalOtherPeople: "1",
    description:
      "Affordable shared room close to USYD campus. The house is in a quiet neighbourhood with parks nearby. Shared with one other friendly tenant. Furnished with single bed, wardrobe, and desk. Common areas are spacious and clean.",
    amenities: ["WiFi included", "Washing machine", "Shared kitchen", "Backyard", "Near parks"],
    houseRules: ["No smoking", "Quiet after 10pm", "Clean up after yourself", "No overnight guests without notice"],
    transport: ["Redfern Station — 7 min walk", "Bus stop George St — 2 min walk", "USYD campus — 10 min walk"],
    safety: { securityCameras: false, securityCamerasLocation: "", weaponsOnProperty: false, weaponsExplanation: "", otherSafetyDetails: "" },
    owner: { name: "David K.", bio: "Property investor based in Redfern. Happy to help new arrivals settle in.", verified: false, responseTime: "Usually within 24 hours" },
    photos: [
      "https://images.unsplash.com/photo-1598928506311-c55ece637a745?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1564078516393-cf04bd966897?w=400&h=300&fit=crop",
    ],
  },
  "3": {
    id: "3",
    title: "Modern ensuite in Waterloo",
    address: "8 Botany Rd",
    suburb: "Waterloo",
    postcode: "2017",
    weeklyPrice: 280,
    bond: "4 weeks rent (AUD $1,120)",
    minStay: "3 months",
    propertyType: "Apartment",
    placeType: "Private room",
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    bathroomType: "private",
    maxGuests: 1,
    furnished: true,
    billsIncluded: true,
    highlights: ["Private bathroom", "Building gym", "Rooftop terrace", "3 min to station"],
    weeklyDiscount: null,
    monthlyDiscount: 10,
    whoElseLivesHere: "Owner lives here",
    totalOtherPeople: "1",
    description:
      "Ensuite room with your own private bathroom in a modern 2-year-old apartment building. The room is fully furnished with a double bed, built-in wardrobe, and study nook. Building has a gym and rooftop terrace. Green Square station is a 3 minute walk.",
    amenities: ["Private bathroom", "WiFi included", "Building gym", "Rooftop terrace", "Air conditioning", "Intercom entry"],
    houseRules: ["No smoking", "Quiet hours 10pm-7am", "No pets in room", "Keep bathroom clean"],
    transport: ["Green Square Station — 3 min walk", "Bus stop Botany Rd — 1 min walk", "CBD — 10 min by train"],
    safety: { securityCameras: true, securityCamerasLocation: "Building lobby and parking", weaponsOnProperty: false, weaponsExplanation: "", otherSafetyDetails: "Secure intercom building entry" },
    owner: { name: "Lisa T.", bio: "Owner-occupier in Waterloo. I keep the apartment in great condition and am very responsive.", verified: true, responseTime: "Usually within 1 hour" },
    photos: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400&h=300&fit=crop",
    ],
  },
  "4": {
    id: "4",
    title: "Budget room near UNSW",
    address: "77 Anzac Pde",
    suburb: "Kensington",
    postcode: "2033",
    weeklyPrice: 200,
    bond: "2 weeks rent (AUD $400)",
    minStay: "6 months",
    propertyType: "House",
    placeType: "Private room",
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    bathroomType: "shared",
    maxGuests: 1,
    furnished: false,
    billsIncluded: false,
    highlights: ["Next to light rail", "Near UNSW", "Large backyard", "BBQ area"],
    weeklyDiscount: null,
    monthlyDiscount: null,
    whoElseLivesHere: "3 other housemates",
    totalOtherPeople: "3",
    description:
      "Unfurnished private room near UNSW in a large 4-bedroom house. Light rail stop is right at the doorstep. Large backyard with BBQ area. Bills are split evenly between housemates. Bring your own furniture or we can help source basics.",
    amenities: ["Large backyard", "BBQ area", "Laundry", "Storage shed", "Street parking"],
    houseRules: ["No smoking inside", "Quiet after 11pm", "Shared chores roster", "Recycling required"],
    transport: ["Light rail Kensington — 1 min walk", "UNSW campus — 5 min walk", "Bus stop Anzac Pde — 2 min walk"],
    safety: { securityCameras: false, securityCamerasLocation: "", weaponsOnProperty: false, weaponsExplanation: "", otherSafetyDetails: "" },
    owner: { name: "Mike R.", bio: "Long-time Kensington local. The house has been a great sharehouse for years.", verified: false, responseTime: "Usually within 12 hours" },
    photos: [
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1564078516393-cf04bd966897?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=400&h=300&fit=crop",
    ],
  },
  "5": {
    id: "5",
    title: "Self-contained studio in Glebe",
    address: "3/15 Glebe Point Rd",
    suburb: "Glebe",
    postcode: "2037",
    weeklyPrice: 310,
    bond: "4 weeks rent (AUD $1,240)",
    minStay: "3 months",
    propertyType: "Studio",
    placeType: "Entire place",
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    bathroomType: "private",
    maxGuests: 2,
    furnished: true,
    billsIncluded: true,
    highlights: ["Self-contained", "All bills included", "Walking to shops", "Private kitchenette"],
    weeklyDiscount: 5,
    monthlyDiscount: 10,
    whoElseLivesHere: "",
    totalOtherPeople: "",
    description:
      "Self-contained studio apartment with kitchenette and private bathroom. Fully furnished with a queen bed, compact kitchen, and small dining area. Walking distance to Broadway Shopping Centre and Glebe Markets. All bills included in rent.",
    amenities: ["Private kitchenette", "Private bathroom", "WiFi included", "Air conditioning", "Laundry in building"],
    houseRules: ["No smoking", "No pets", "Quiet hours 10pm-8am", "No subletting"],
    transport: ["Glebe light rail — 5 min walk", "Bus stop Glebe Point Rd — 1 min walk", "Broadway Shopping Centre — 8 min walk"],
    safety: { securityCameras: true, securityCamerasLocation: "Building entrance", weaponsOnProperty: false, weaponsExplanation: "", otherSafetyDetails: "" },
    owner: { name: "Jenny W.", bio: "I own several studios in the Glebe area. Clean, well-maintained, and great for independent living.", verified: true, responseTime: "Usually within 4 hours" },
    photos: [
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=400&h=300&fit=crop",
    ],
  },
  "6": {
    id: "6",
    title: "Budget room near Olympic Park",
    address: "22 Parramatta Rd",
    suburb: "Homebush",
    postcode: "2140",
    weeklyPrice: 190,
    bond: "2 weeks rent (AUD $380)",
    minStay: "1 month",
    propertyType: "House",
    placeType: "Shared room",
    bedrooms: 1,
    beds: 2,
    bathrooms: 1,
    bathroomType: "shared",
    maxGuests: 2,
    furnished: true,
    billsIncluded: true,
    highlights: ["All bills included", "Near Olympic Park", "Budget-friendly", "Close to shops"],
    weeklyDiscount: null,
    monthlyDiscount: null,
    whoElseLivesHere: "Family home",
    totalOtherPeople: "3",
    description:
      "Budget-friendly shared room near Olympic Park. All bills and WiFi are included in the rent. The house is clean and well-maintained. Close to Homebush station and local shops. Ideal for new arrivals looking for an affordable start.",
    amenities: ["WiFi included", "All bills included", "Washing machine", "Shared kitchen", "Near shops"],
    houseRules: ["No smoking", "Quiet after 10pm", "Keep kitchen clean", "No parties"],
    transport: ["Homebush Station — 8 min walk", "Olympic Park — 5 min walk", "Bus stop Parramatta Rd — 1 min walk"],
    safety: { securityCameras: false, securityCamerasLocation: "", weaponsOnProperty: false, weaponsExplanation: "", otherSafetyDetails: "" },
    owner: { name: "Raj P.", bio: "I manage a few properties in Homebush. Friendly and always available for any issues.", verified: false, responseTime: "Usually within 6 hours" },
    photos: [
      "https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1564078516393-cf04bd966897?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=400&h=300&fit=crop",
    ],
  },
};

export default function RoomDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { session } = useAuth();
  const [activePhoto, setActivePhoto] = useState(0);
  const [interestSent, setInterestSent] = useState(false);
  const [message, setMessage] = useState("");
  const [reportOpen, setReportOpen] = useState(false);

  // Deal customization state
  const [dealStartDate, setDealStartDate] = useState("");
  const [dealEndDate, setDealEndDate] = useState("");
  const [dealGuests, setDealGuests] = useState(1);
  const [dealSpecialRequests, setDealSpecialRequests] = useState("");

  const room = ROOMS[id as string] || ROOMS["1"];

  const handleInterest = () => {
    setInterestSent(true);
  };

  const hasSafetyInfo = room.safety && (
    room.safety.securityCameras ||
    room.safety.weaponsOnProperty ||
    room.safety.otherSafetyDetails
  );

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400"
      >
        <Link href="/seeker/search" className="hover:text-rose-500 transition-colors">
          Search
        </Link>
        <span>/</span>
        <span className="text-slate-900 dark:text-white font-medium">
          {room.suburb}, {room.postcode}
        </span>
      </motion.div>

      {/* Photo carousel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-4 gap-2 rounded-2xl overflow-hidden"
      >
        <div className="col-span-4 md:col-span-2 aspect-video bg-slate-100 dark:bg-slate-800 overflow-hidden cursor-pointer">
          <img
            src={room.photos[activePhoto]}
            alt={`${room.address} photo ${activePhoto + 1}`}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
        {room.photos.slice(1, 5).map((photo: string, i: number) => (
          <div
            key={i}
            onClick={() => setActivePhoto(i + 1)}
            className={`hidden md:block aspect-video bg-slate-100 dark:bg-slate-800 overflow-hidden cursor-pointer ${
              activePhoto === i + 1 ? "ring-2 ring-rose-500 ring-offset-1" : ""
            }`}
          >
            <img
              src={photo}
              alt={`${room.address} photo ${i + 2}`}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>
        ))}
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              {room.title || `${room.address}, ${room.suburb}`}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {room.address}, {room.suburb} {room.postcode}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              {room.propertyType} &middot; {room.placeType} &middot; {room.bedrooms} bed{room.bedrooms !== 1 ? "s" : ""} &middot; {room.bathrooms} bath ({room.bathroomType}) &middot; Up to {room.maxGuests} guest{room.maxGuests !== 1 ? "s" : ""}
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-sm">
                AUD ${room.weeklyPrice}/wk
              </span>
              {room.billsIncluded && (
                <span className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                  Bills included
                </span>
              )}
              <span className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium">
                Min stay: {room.minStay}
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium">
                Bond: {room.bond}
              </span>
            </div>
            {/* Discounts */}
            {(room.weeklyDiscount || room.monthlyDiscount) && (
              <div className="flex gap-2 mt-3">
                {room.weeklyDiscount && (
                  <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20">
                    {room.weeklyDiscount}% weekly discount
                  </span>
                )}
                {room.monthlyDiscount && (
                  <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20">
                    {room.monthlyDiscount}% monthly discount
                  </span>
                )}
              </div>
            )}
          </motion.div>

          {/* Highlights */}
          {room.highlights && room.highlights.length > 0 && (
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Highlights</h2>
              <div className="flex flex-wrap gap-2">
                {room.highlights.map((h: string, i: number) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-full text-sm font-medium bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20"
                  >
                    {h}
                  </span>
                ))}
              </div>
            </motion.section>
          )}

          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">About this room</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{room.description}</p>
          </motion.section>

          {/* Who else lives here */}
          {room.whoElseLivesHere && room.placeType !== "Entire place" && (
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.17 }}>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Who else is there?</h2>
              <div className="card-subtle p-4 rounded-xl">
                <p className="text-sm text-slate-600 dark:text-slate-300">{room.whoElseLivesHere}</p>
                {room.totalOtherPeople && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Total other people: {room.totalOtherPeople}</p>
                )}
              </div>
            </motion.section>
          )}

          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Amenities</h2>
            <div className="grid sm:grid-cols-2 gap-2">
              {room.amenities.map((item: string, i: number) => (
                <div key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <span className="text-rose-500">&#10003;</span>
                  {item}
                </div>
              ))}
            </div>
          </motion.section>

          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">House rules</h2>
            <div className="space-y-2">
              {room.houseRules.map((rule: string, i: number) => (
                <div key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <span className="text-slate-400 dark:text-slate-500">&bull;</span>
                  {rule}
                </div>
              ))}
            </div>
          </motion.section>

          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Transport</h2>
            <div className="space-y-2">
              {room.transport.map((item: string, i: number) => (
                <div key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {item}
                </div>
              ))}
            </div>
          </motion.section>

          {/* Safety section */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.33 }}>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Safety &amp; property info</h2>
            <div className="card p-5 rounded-2xl space-y-3">
              {hasSafetyInfo ? (
                <>
                  {room.safety.securityCameras && (
                    <div className="flex items-start gap-2 text-sm">
                      <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <div>
                        <p className="font-medium text-slate-700 dark:text-slate-300">Security cameras on property</p>
                        {room.safety.securityCamerasLocation && (
                          <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Location: {room.safety.securityCamerasLocation}</p>
                        )}
                      </div>
                    </div>
                  )}
                  {room.safety.weaponsOnProperty && (
                    <div className="flex items-start gap-2 text-sm">
                      <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div>
                        <p className="font-medium text-slate-700 dark:text-slate-300">Weapons stored on property</p>
                        {room.safety.weaponsExplanation && (
                          <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">{room.safety.weaponsExplanation}</p>
                        )}
                      </div>
                    </div>
                  )}
                  {room.safety.otherSafetyDetails && (
                    <div className="flex items-start gap-2 text-sm">
                      <svg className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <div>
                        <p className="font-medium text-slate-700 dark:text-slate-300">Other safety info</p>
                        <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">{room.safety.otherSafetyDetails}</p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No specific safety details disclosed by the owner. Always inspect the property before committing.
                </p>
              )}
            </div>
          </motion.section>

          {/* Owner */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Owner</h2>
            <div className="card p-5 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-400 to-rose-500 flex items-center justify-center text-white font-bold text-lg">
                  {room.owner.name[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">{room.owner.name}</span>
                    {room.owner.verified && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        &#10003; Verified
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{room.owner.responseTime}</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-3">{room.owner.bio}</p>
            </div>
          </motion.section>

          {/* Report button */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            <button
              onClick={() => setReportOpen(true)}
              className="text-sm text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
              </svg>
              Report this listing
            </button>
          </motion.div>
        </div>

        {/* Sidebar CTA */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card p-6 rounded-2xl space-y-4"
              id="interest"
            >
              <div className="text-center">
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  AUD ${room.weeklyPrice}
                  <span className="text-base font-normal text-slate-500 dark:text-slate-400">/wk</span>
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  {room.placeType} &middot; {room.furnished ? "Furnished" : "Unfurnished"}
                </p>
              </div>

              {/* Deal customization section */}
              {session && !interestSent && (
                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-700/50">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Customise your deal</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Start date</label>
                      <input
                        type="date"
                        value={dealStartDate}
                        onChange={(e) => setDealStartDate(e.target.value)}
                        className="input-field text-xs py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">End date</label>
                      <input
                        type="date"
                        value={dealEndDate}
                        onChange={(e) => setDealEndDate(e.target.value)}
                        className="input-field text-xs py-2"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Total guests</label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setDealGuests(Math.max(1, dealGuests - 1))}
                        className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:border-rose-400 text-sm"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-sm font-bold text-slate-900 dark:text-white">{dealGuests}</span>
                      <button
                        type="button"
                        onClick={() => setDealGuests(Math.min(room.maxGuests || 20, dealGuests + 1))}
                        className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:border-rose-400 text-sm"
                      >
                        +
                      </button>
                      <span className="text-[11px] text-slate-400 ml-1">max {room.maxGuests}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Special requests (optional)</label>
                    <textarea
                      placeholder="e.g. Early check-in, extra keys..."
                      value={dealSpecialRequests}
                      onChange={(e) => setDealSpecialRequests(e.target.value)}
                      rows={2}
                      className="input-field text-xs"
                    />
                  </div>
                </div>
              )}

              {!session ? (
                <div className="text-center space-y-3">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Sign in to express interest
                  </p>
                  <Link
                    href="/signin"
                    className="btn-primary py-3 px-6 rounded-xl text-sm inline-block w-full text-center"
                  >
                    Sign in
                  </Link>
                </div>
              ) : interestSent ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl p-4 text-center"
                >
                  <svg className="w-8 h-8 mx-auto text-emerald-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    Interest sent!
                  </p>
                  <p className="text-xs text-emerald-500 dark:text-emerald-400/70 mt-1">
                    The owner will review your profile.
                  </p>
                  {dealStartDate && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                      {dealStartDate}{dealEndDate ? ` — ${dealEndDate}` : ""} &middot; {dealGuests} guest{dealGuests !== 1 ? "s" : ""}
                    </p>
                  )}
                </motion.div>
              ) : (
                <>
                  <textarea
                    placeholder="Introduce yourself briefly (optional)..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    className="input-field text-sm"
                  />
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleInterest}
                    className="btn-primary py-3 rounded-xl text-sm font-bold w-full"
                  >
                    I&apos;m interested
                  </motion.button>
                </>
              )}
            </motion.div>

            <Link
              href="/seeker/search"
              className="block text-center text-sm text-slate-500 dark:text-slate-400 hover:text-rose-500 transition-colors"
            >
              &larr; Back to search
            </Link>
          </div>
        </div>
      </div>

      {/* Report modal */}
      <ReportModal
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
        itemType="listing"
        itemId={room.id}
      />
    </div>
  );
}

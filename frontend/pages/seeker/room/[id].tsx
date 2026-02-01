import { useRouter } from "next/router";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../../hooks/useAuth";

const MOCK_ROOM = {
  id: "1",
  address: "12 Crown St",
  suburb: "Surry Hills",
  postcode: "2010",
  weeklyPrice: 250,
  bond: "4 weeks rent ($1,000)",
  minStay: "3 months",
  roomType: "Private room",
  furnished: true,
  billsIncluded: true,
  privateBathroom: false,
  parking: false,
  description:
    "Bright and spacious private room in a friendly 3-bedroom sharehouse. The room gets plenty of natural light and comes fully furnished with a queen bed, desk, and wardrobe. Shared kitchen and bathroom are well-maintained. Great for students or young professionals.",
  amenities: [
    "WiFi included",
    "Washing machine",
    "Fully equipped kitchen",
    "Living room",
    "Balcony",
    "Air conditioning",
  ],
  houseRules: [
    "No smoking inside",
    "Quiet hours 10pm-7am",
    "No pets",
    "Keep shared spaces tidy",
    "Guests welcome (notify housemates)",
  ],
  transport: [
    "Central Station — 5 min walk",
    "Bus stop Crown St — 1 min walk",
    "Light rail Surry Hills — 8 min walk",
  ],
  owner: {
    name: "Sarah M.",
    bio: "Local Surry Hills owner. I live nearby and keep the property well maintained.",
    verified: true,
    responseTime: "Usually within 2 hours",
  },
  photos: [
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=400&h=300&fit=crop",
  ],
};

export default function RoomDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { session } = useAuth();
  const [activePhoto, setActivePhoto] = useState(0);
  const [interestSent, setInterestSent] = useState(false);
  const [message, setMessage] = useState("");

  // In production, fetch room by id. Using mock data here.
  const room = MOCK_ROOM;

  const handleInterest = () => {
    // In production: POST to /api/matches or deal flow
    setInterestSent(true);
  };

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
        {/* Main photo */}
        <div className="col-span-4 md:col-span-2 aspect-video bg-slate-100 dark:bg-slate-800 overflow-hidden cursor-pointer">
          <img
            src={room.photos[activePhoto]}
            alt={`${room.address} photo ${activePhoto + 1}`}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
        {/* Thumbnail grid */}
        {room.photos.slice(1, 5).map((photo, i) => (
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
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              {room.address}, {room.suburb}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{room.postcode}</p>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-sm">
                ${room.weeklyPrice}/wk
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
          </motion.div>

          {/* Description */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">About this room</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{room.description}</p>
          </motion.section>

          {/* Amenities */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Amenities</h2>
            <div className="grid sm:grid-cols-2 gap-2">
              {room.amenities.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <span className="text-rose-500">✓</span>
                  {item}
                </div>
              ))}
            </div>
          </motion.section>

          {/* House rules */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">House rules</h2>
            <div className="space-y-2">
              {room.houseRules.map((rule, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <span className="text-slate-400 dark:text-slate-500">•</span>
                  {rule}
                </div>
              ))}
            </div>
          </motion.section>

          {/* Transport */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Transport</h2>
            <div className="space-y-2">
              {room.transport.map((item, i) => (
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

          {/* Owner profile */}
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
                        ✓ Verified
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{room.owner.responseTime}</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-3">{room.owner.bio}</p>
            </div>
          </motion.section>
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
                  ${room.weeklyPrice}
                  <span className="text-base font-normal text-slate-500 dark:text-slate-400">/wk</span>
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  {room.roomType} · {room.furnished ? "Furnished" : "Unfurnished"}
                </p>
              </div>

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
              ← Back to search
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

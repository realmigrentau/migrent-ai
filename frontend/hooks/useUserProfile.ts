import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export interface UserProfile {
  id: string;
  name: string | null;
  preferred_name: string | null;
  about_me: string | null;
  bio: string | null;
  custom_pfp: string | null;
  role: string | null;
  is_verified: boolean;
  verified: boolean;
  identity_verified: boolean;
  verified_date: string | null;
  verification_method: string | null;
  reviews_count: number;
  average_rating: number;
  months_hosting: number;
  response_rate: number;
  response_time: string;
  languages: string[];
  work: string | null;
  location: string | null;
  profile_photos: string[];
  social_twitter: string | null;
  social_facebook: string | null;
  social_linkedin: string | null;
  most_useless_skill: string | null;
  badges: string[];
  rooms_owned: number;
  properties_owned: number;
  created_at: string | null;
  lifestyle: string[];
  interests: string[];
  age: string | null;
  occupation: string | null;
  visa_type: string | null;
  member_since_label: string | null;
  months_on_platform: number;
}

export interface ProfileBadges {
  isVerified: boolean;
  verifiedDate: string | null;
  isSuperhost: boolean;
  isVerifiedHost: boolean;
  verifiedLabel: string | null;
}

function computeBadges(profile: UserProfile): ProfileBadges {
  const isVerified = profile.is_verified === true || profile.identity_verified === true;

  let verifiedLabel: string | null = null;
  if (isVerified && profile.verified_date) {
    const d = new Date(profile.verified_date);
    const month = d.toLocaleString("en-US", { month: "long" });
    const year = d.getFullYear();
    verifiedLabel = `${month} ${year}`;
  } else if (isVerified) {
    verifiedLabel = "Verified";
  }

  const isSuperhost = profile.average_rating >= 4.8 && profile.reviews_count >= 10;
  const isVerifiedHost = (profile.rooms_owned || 0) > 0 || (profile.properties_owned || 0) > 0;

  return { isVerified, verifiedDate: profile.verified_date, isSuperhost, isVerifiedHost, verifiedLabel };
}

function computeMonthsOnPlatform(createdAt: string | null): number {
  if (!createdAt) return 0;
  const created = new Date(createdAt);
  const now = new Date();
  return Math.max(0, (now.getFullYear() - created.getFullYear()) * 12 + (now.getMonth() - created.getMonth()));
}

function computeResponseTime(months: number): string {
  if (months >= 12) return "within an hour";
  if (months >= 6) return "within a few hours";
  return "within a day";
}

function computeResponseRate(months: number): number {
  if (months >= 6) return 100;
  if (months >= 3) return 95;
  return 90;
}

/** Fetch profile directly from Supabase (fast, no Railway middleman) */
async function fetchProfileDirect(userId: string): Promise<any | null> {
  try {
    // Use select("*") to get all available columns — Supabase only returns columns that exist
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Supabase profile fetch error:", error);
      return null;
    }
    return data;
  } catch (err) {
    console.error("fetchProfileDirect error:", err);
    return null;
  }
}

export function useUserProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [badges, setBadges] = useState<ProfileBadges | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchProfileDirect(userId!);
        if (cancelled) return;
        if (!data) {
          setError("Profile not found");
          setProfile(null);
          setBadges(null);
        } else {
          const createdAt = data.created_at || null;
          const monthsOnPlatform = computeMonthsOnPlatform(createdAt);
          const responseRate = data.response_rate && data.response_rate !== 100 ? data.response_rate : computeResponseRate(monthsOnPlatform);
          const responseTime = data.response_time && data.response_time !== "within 24h" ? data.response_time : computeResponseTime(monthsOnPlatform);
          const memberSince = createdAt ? new Date(createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : null;

          const p: UserProfile = {
            id: data.id || userId!,
            name: data.name || data.preferred_name || null,
            preferred_name: data.preferred_name || null,
            about_me: data.about_me || data.bio || null,
            bio: data.bio || data.about_me || null,
            custom_pfp: data.custom_pfp || null,
            role: data.role || null,
            is_verified: data.is_verified ?? false,
            verified: data.verified ?? false,
            identity_verified: data.identity_verified ?? false,
            verified_date: data.verified_date || null,
            verification_method: data.verification_method || null,
            reviews_count: data.reviews_count ?? 0,
            average_rating: data.average_rating ?? 0,
            months_hosting: data.months_hosting ?? 0,
            response_rate: responseRate,
            response_time: responseTime,
            languages: data.languages || ["English"],
            work: data.work || data.occupation || null,
            location: data.location || null,
            profile_photos: data.profile_photos || [],
            social_twitter: data.social_twitter || null,
            social_facebook: data.social_facebook || null,
            social_linkedin: data.social_linkedin || null,
            most_useless_skill: data.most_useless_skill || null,
            badges: data.badges || [],
            rooms_owned: data.rooms_owned ?? 0,
            properties_owned: data.properties_owned ?? 0,
            created_at: createdAt,
            lifestyle: data.lifestyle || [],
            interests: data.interests || [],
            age: data.age || null,
            occupation: data.occupation || null,
            visa_type: data.visa_type || null,
            member_since_label: memberSince,
            months_on_platform: monthsOnPlatform,
          };
          setProfile(p);
          setBadges(computeBadges(p));
        }
      } catch (err) {
        if (!cancelled) { setError("Failed to load profile"); console.error("useUserProfile error:", err); }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [userId]);

  return { profile, badges, loading, error };
}

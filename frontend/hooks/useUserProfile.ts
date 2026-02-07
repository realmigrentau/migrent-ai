import { useState, useEffect } from "react";
import { getPublicProfile } from "../lib/api";

export interface UserProfile {
  id: string;
  name: string | null;
  preferred_name: string | null;
  about_me: string | null;
  bio: string | null;
  custom_pfp: string | null;
  role: string | null;
  is_verified: boolean;
  verified_date: string | null;
  verification_method: string | null;
  reviews_count: number;
  average_rating: number;
  months_hosting: number;
  response_rate: number;
  response_time: string | null;
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
}

export interface ProfileBadges {
  isVerified: boolean;
  verifiedDate: string | null;
  isSuperhost: boolean;
  isVerifiedHost: boolean;
  verifiedLabel: string | null;
}

function computeBadges(profile: UserProfile): ProfileBadges {
  const isVerified = profile.is_verified === true;

  let verifiedLabel: string | null = null;
  if (isVerified && profile.verified_date) {
    const d = new Date(profile.verified_date);
    const month = d.toLocaleString("en-US", { month: "long" });
    const year = d.getFullYear();
    verifiedLabel = `${month} ${year}`;
  }

  const isSuperhost =
    profile.average_rating >= 4.8 && profile.reviews_count >= 10;

  const isVerifiedHost =
    (profile.rooms_owned || 0) > 0 || (profile.properties_owned || 0) > 0;

  return {
    isVerified,
    verifiedDate: profile.verified_date,
    isSuperhost,
    isVerifiedHost,
    verifiedLabel,
  };
}

export function useUserProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [badges, setBadges] = useState<ProfileBadges | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getPublicProfile(userId!);
        if (cancelled) return;
        if (!data) {
          setError("Profile not found");
          setProfile(null);
          setBadges(null);
        } else {
          const p: UserProfile = {
            id: data.id || userId!,
            name: data.name || data.preferred_name || null,
            preferred_name: data.preferred_name || null,
            about_me: data.about_me || data.bio || null,
            bio: data.bio || data.about_me || null,
            custom_pfp: data.custom_pfp || null,
            role: data.role || null,
            is_verified: data.is_verified ?? false,
            verified_date: data.verified_date || null,
            verification_method: data.verification_method || null,
            reviews_count: data.reviews_count ?? 0,
            average_rating: data.average_rating ?? 0,
            months_hosting: data.months_hosting ?? 0,
            response_rate: data.response_rate ?? 100,
            response_time: data.response_time || "within 24h",
            languages: data.languages || ["English"],
            work: data.work || null,
            location: data.location || null,
            profile_photos: data.profile_photos || [],
            social_twitter: data.social_twitter || null,
            social_facebook: data.social_facebook || null,
            social_linkedin: data.social_linkedin || null,
            most_useless_skill: data.most_useless_skill || null,
            badges: data.badges || [],
            rooms_owned: data.rooms_owned ?? 0,
            properties_owned: data.properties_owned ?? 0,
            created_at: data.created_at || null,
          };
          setProfile(p);
          setBadges(computeBadges(p));
        }
      } catch (err) {
        if (!cancelled) {
          setError("Failed to load profile");
          console.error("useUserProfile error:", err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return { profile, badges, loading, error };
}

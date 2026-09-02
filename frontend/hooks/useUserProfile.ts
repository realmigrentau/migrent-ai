import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

/**
 * Another user's public profile.
 *
 * Reads the `public_profiles` view only. The view derives every trust
 * field from owner_verification (identity_verified, verification_status,
 * email_verified, phone_verified, government_id_status); the paid
 * `verified` flag and the free-text badges array are never treated as
 * trust. Lookups accept the opaque public id or, for old links, the UUID.
 */

export interface UserProfile {
  id: string;
  public_id: string | null;
  name: string | null;
  preferred_name: string | null;
  about_me: string | null;
  bio: string | null;
  custom_pfp: string | null;
  identity_verified: boolean;
  verification_status: "verified" | "pending" | "unverified";
  email_verified: boolean;
  phone_verified: boolean;
  government_id_status: "approved" | "pending" | "rejected" | "not_submitted";
  verified_date: string | null;
  reviews_count: number;
  average_rating: number;
  months_hosting: number;
  /** Null when the host has had too few conversations to measure. */
  response_rate: number | null;
  /** Null when unmeasurable. */
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
  lifestyle: string[];
  interests: string[];
  occupation: string | null;
  member_since_label: string | null;
  months_on_platform: number;
}

export interface ProfileBadges {
  isVerified: boolean;
  verifiedDate: string | null;
  isSuperhost: boolean;
  verifiedLabel: string | null;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PUBLIC_ID_RE = /^[a-z0-9]{6,32}$/;

/** Achievement badges the platform recognises. Anything else (including any
 * string that reads like a trust claim) is not rendered. */
const ALLOWED_BADGES = new Set(["Booked 1+ rooms", "Frequent Renter", "Seasoned Renter", "Superhost", "Mega Host", "Early member", "Mentor"]);

function computeBadges(profile: UserProfile): ProfileBadges {
  const isVerified = profile.identity_verified === true && profile.verification_status === "verified";
  let verifiedLabel: string | null = null;
  if (isVerified && profile.verified_date) {
    const d = new Date(profile.verified_date);
    verifiedLabel = `${d.toLocaleString("en-AU", { month: "long" })} ${d.getFullYear()}`;
  } else if (isVerified) {
    verifiedLabel = "ID checked";
  }
  const isSuperhost = profile.average_rating >= 4.8 && profile.reviews_count >= 10;
  return { isVerified, verifiedDate: profile.verified_date, isSuperhost, verifiedLabel };
}

function computeMonthsOnPlatform(createdAt: string | null): number {
  if (!createdAt) return 0;
  const created = new Date(createdAt);
  const now = new Date();
  return Math.max(0, (now.getFullYear() - created.getFullYear()) * 12 + (now.getMonth() - created.getMonth()));
}

function formatReplyTime(hours: number | null | undefined): string | null {
  if (typeof hours !== "number" || Number.isNaN(hours)) return null;
  if (hours < 1) return "within an hour";
  if (hours < 6) return "within a few hours";
  if (hours < 24) return "within a day";
  if (hours < 72) return "within a few days";
  return "occasionally";
}

async function fetchPublicProfile(idOrPublicId: string): Promise<Record<string, unknown> | null> {
  try {
    let query = supabase.from("public_profiles").select("*");
    if (UUID_RE.test(idOrPublicId)) query = query.eq("id", idOrPublicId);
    else if (PUBLIC_ID_RE.test(idOrPublicId)) query = query.eq("public_id", idOrPublicId);
    else return null;
    const { data, error } = await query.maybeSingle();
    if (error) {
      console.error("Supabase profile fetch error:", error);
      return null;
    }
    return data as Record<string, unknown> | null;
  } catch (err) {
    console.error("fetchPublicProfile error:", err);
    return null;
  }
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
        const data = await fetchPublicProfile(userId!);
        if (cancelled) return;
        if (!data) {
          setError("Profile not found");
          setProfile(null);
          setBadges(null);
          return;
        }
        const createdAt = (data.created_at as string) || null;
        const str = (k: string) => (typeof data[k] === "string" ? (data[k] as string) : null);
        const num = (k: string) => (typeof data[k] === "number" ? (data[k] as number) : 0);
        const arr = (k: string) => (Array.isArray(data[k]) ? (data[k] as string[]) : []);
        const status = str("verification_status");
        const idStatus = str("government_id_status");
        const p: UserProfile = {
          id: (data.id as string) || userId!,
          public_id: str("public_id"),
          name: str("name") || str("preferred_name"),
          preferred_name: str("preferred_name"),
          about_me: str("about_me") || str("bio"),
          bio: str("bio") || str("about_me"),
          custom_pfp: str("custom_pfp")?.startsWith("http") ? str("custom_pfp") : null,
          identity_verified: data.identity_verified === true,
          verification_status: status === "verified" || status === "pending" ? status : "unverified",
          email_verified: data.email_verified === true,
          phone_verified: data.phone_verified === true,
          government_id_status: idStatus === "approved" || idStatus === "pending" || idStatus === "rejected" ? idStatus : "not_submitted",
          verified_date: str("verified_date"),
          reviews_count: num("reviews_count"),
          average_rating: num("average_rating"),
          months_hosting: num("months_hosting"),
          response_rate: typeof data.response_rate === "number" ? (data.response_rate as number) : null,
          response_time: formatReplyTime(data.median_reply_hours as number | null),
          languages: arr("languages").length ? arr("languages") : ["English"],
          work: str("work") || str("occupation"),
          location: str("location"),
          profile_photos: arr("profile_photos"),
          social_twitter: str("social_twitter"),
          social_facebook: str("social_facebook"),
          social_linkedin: str("social_linkedin"),
          most_useless_skill: str("most_useless_skill"),
          badges: arr("badges").filter((b) => ALLOWED_BADGES.has(b)),
          rooms_owned: num("rooms_owned"),
          properties_owned: num("properties_owned"),
          created_at: createdAt,
          lifestyle: arr("lifestyle"),
          interests: arr("interests"),
          occupation: str("occupation"),
          member_since_label: createdAt ? new Date(createdAt).toLocaleDateString("en-AU", { month: "long", year: "numeric" }) : null,
          months_on_platform: computeMonthsOnPlatform(createdAt),
        };
        setProfile(p);
        setBadges(computeBadges(p));
      } catch (err) {
        if (!cancelled) {
          setError("Failed to load profile");
          console.error("useUserProfile error:", err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return { profile, badges, loading, error };
}

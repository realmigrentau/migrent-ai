// Real data fetching for SuperAdmin dashboard from Supabase
import { supabase } from "./supabase";

export interface AdminUser {
  id: string;
  email: string;
  role: "seeker" | "owner" | "superadmin";
  signupDate: string;
  lastActive: string;
  verified: boolean;
  suspended: boolean;
}

export interface AdminListing {
  id: string;
  title: string;
  ownerEmail: string;
  suburb: string;
  status: "active" | "pending" | "rejected";
  applicants: number;
  weeklyPrice: number;
  createdAt: string;
}

export interface AdminPayment {
  id: string;
  email: string;
  amount: number;
  type: "owner_fee" | "seeker_fee" | "subscription";
  date: string;
  status: "completed" | "pending" | "refunded";
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
}

export interface SignupFunnel {
  stage: string;
  count: number;
}

// ─── Fetch Real Users from profiles table ───
export async function fetchAdminUsers(): Promise<AdminUser[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, role, created_at, last_sign_in_at, email_verified, suspended")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching users:", error);
    return [];
  }

  return (data || []).map((u: any) => ({
    id: u.id,
    email: u.email || "No email",
    role: u.role || "seeker",
    signupDate: u.created_at ? new Date(u.created_at).toISOString().split("T")[0] : "",
    lastActive: u.last_sign_in_at ? new Date(u.last_sign_in_at).toISOString().split("T")[0] : "",
    verified: u.email_verified ?? false,
    suspended: u.suspended ?? false,
  }));
}

// ─── Fetch Real Listings ───
export async function fetchAdminListings(): Promise<AdminListing[]> {
  const { data, error } = await supabase
    .from("listings")
    .select(`
      id,
      title,
      suburb,
      status,
      weekly_price,
      daily_price,
      created_at,
      owner_id,
      profiles!listings_owner_id_fkey(email)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching listings:", error);
    return [];
  }

  return (data || []).map((l: any) => ({
    id: l.id,
    title: l.title || "Untitled",
    ownerEmail: l.profiles?.email || "Unknown",
    suburb: l.suburb || "",
    status: l.status || "pending",
    applicants: 0, // Would need a separate applications table query
    weeklyPrice: l.weekly_price || l.daily_price * 7 || 0,
    createdAt: l.created_at ? new Date(l.created_at).toISOString().split("T")[0] : "",
  }));
}

// ─── Fetch Real Payments (if payments table exists) ───
export async function fetchAdminPayments(): Promise<AdminPayment[]> {
  const { data, error } = await supabase
    .from("payments")
    .select("id, user_id, amount, type, created_at, status, profiles!payments_user_id_fkey(email)")
    .order("created_at", { ascending: false });

  if (error) {
    // Table might not exist yet
    console.error("Error fetching payments:", error);
    return [];
  }

  return (data || []).map((p: any) => ({
    id: p.id,
    email: p.profiles?.email || "Unknown",
    amount: p.amount || 0,
    type: p.type || "subscription",
    date: p.created_at ? new Date(p.created_at).toISOString().split("T")[0] : "",
    status: p.status || "completed",
  }));
}

// ─── Fetch Admin Stats ───
export async function fetchAdminStats() {
  // Get total users count
  const { count: userCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  // Get active listings count
  const { count: listingCount } = await supabase
    .from("listings")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  // Get total revenue from payments (if table exists)
  let totalRevenue = 0;
  let monthlyRevenue = 0;

  const { data: payments } = await supabase
    .from("payments")
    .select("amount, created_at, status")
    .eq("status", "completed");

  if (payments) {
    totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

    // Calculate this month's revenue
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    monthlyRevenue = payments
      .filter((p) => {
        const d = new Date(p.created_at);
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
      })
      .reduce((sum, p) => sum + (p.amount || 0), 0);
  }

  return {
    totalUsers: userCount || 0,
    activeListings: listingCount || 0,
    totalRevenue,
    monthlyRevenue,
  };
}

// ─── Fetch Monthly Revenue Data ───
export async function fetchMonthlyRevenue(): Promise<MonthlyRevenue[]> {
  const { data: payments } = await supabase
    .from("payments")
    .select("amount, created_at, status")
    .eq("status", "completed")
    .order("created_at", { ascending: true });

  if (!payments || payments.length === 0) {
    return [];
  }

  // Group by month
  const monthMap = new Map<string, number>();
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  payments.forEach((p) => {
    const d = new Date(p.created_at);
    const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
    monthMap.set(key, (monthMap.get(key) || 0) + (p.amount || 0));
  });

  // Return last 6 months
  return Array.from(monthMap.entries())
    .slice(-6)
    .map(([month, revenue]) => ({ month: month.split(" ")[0], revenue }));
}

// ─── Fetch Revenue by Role ───
export async function fetchRevenueByRole() {
  const { data: payments } = await supabase
    .from("payments")
    .select("amount, type, status")
    .eq("status", "completed");

  if (!payments || payments.length === 0) {
    return [
      { name: "Owner fees", value: 0, fill: "#f43f5e" },
      { name: "Seeker fees", value: 0, fill: "#3b82f6" },
    ];
  }

  const ownerFees = payments
    .filter((p) => p.type === "owner_fee")
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const seekerFees = payments
    .filter((p) => p.type === "seeker_fee")
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  return [
    { name: "Owner fees", value: ownerFees, fill: "#f43f5e" },
    { name: "Seeker fees", value: seekerFees, fill: "#3b82f6" },
  ];
}

// ─── Fetch Signup Funnel ───
export async function fetchSignupFunnel(): Promise<SignupFunnel[]> {
  const { count: totalUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  const { count: verifiedUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("email_verified", true);

  const { count: activeListings } = await supabase
    .from("listings")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  // For "Visited" we'd need analytics - use a placeholder multiplier for now
  const visited = (totalUsers || 0) * 10;

  return [
    { stage: "Visited", count: visited },
    { stage: "Signed up", count: totalUsers || 0 },
    { stage: "Verified", count: verifiedUsers || 0 },
    { stage: "Active listing/search", count: activeListings || 0 },
  ];
}

// ─── Fetch Geographic Data ───
export async function fetchGeoData() {
  const { data: listings } = await supabase
    .from("listings")
    .select("suburb")
    .eq("status", "active");

  if (!listings || listings.length === 0) {
    return [];
  }

  // Group by suburb
  const suburbMap = new Map<string, number>();
  listings.forEach((l) => {
    if (l.suburb) {
      suburbMap.set(l.suburb, (suburbMap.get(l.suburb) || 0) + 1);
    }
  });

  return Array.from(suburbMap.entries())
    .map(([suburb, users]) => ({ suburb, users }))
    .sort((a, b) => b.users - a.users)
    .slice(0, 10);
}

// ─── CSV Export ───
export function exportCSV(filename: string, headers: string[], rows: string[][]) {
  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

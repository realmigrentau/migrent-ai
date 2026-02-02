// Mock data for SuperAdmin dashboard — replace with real Supabase queries later

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

// ─── Mock Users ───
export const mockUsers: AdminUser[] = [
  { id: "u1", email: "alice@gmail.com", role: "seeker", signupDate: "2025-11-02", lastActive: "2026-02-01", verified: true, suspended: false },
  { id: "u2", email: "bob@outlook.com", role: "owner", signupDate: "2025-10-15", lastActive: "2026-02-02", verified: true, suspended: false },
  { id: "u3", email: "carol@uni.edu.au", role: "seeker", signupDate: "2025-12-20", lastActive: "2026-01-28", verified: false, suspended: false },
  { id: "u4", email: "dave@realestate.com.au", role: "owner", signupDate: "2025-09-05", lastActive: "2026-02-01", verified: true, suspended: false },
  { id: "u5", email: "admin@migrent.com.au", role: "superadmin", signupDate: "2025-08-01", lastActive: "2026-02-02", verified: true, suspended: false },
  { id: "u6", email: "emma@proton.me", role: "seeker", signupDate: "2026-01-03", lastActive: "2026-01-30", verified: true, suspended: false },
  { id: "u7", email: "frank@yahoo.com", role: "owner", signupDate: "2025-11-18", lastActive: "2026-01-25", verified: true, suspended: true },
  { id: "u8", email: "grace@icloud.com", role: "seeker", signupDate: "2026-01-10", lastActive: "2026-02-01", verified: false, suspended: false },
  { id: "u9", email: "henry@live.com.au", role: "owner", signupDate: "2025-12-01", lastActive: "2026-01-29", verified: true, suspended: false },
  { id: "u10", email: "iris@student.uts.edu.au", role: "seeker", signupDate: "2026-01-20", lastActive: "2026-02-02", verified: false, suspended: false },
  { id: "u11", email: "jake@domain.com", role: "seeker", signupDate: "2025-10-08", lastActive: "2026-01-15", verified: true, suspended: false },
  { id: "u12", email: "kate@hotmail.com", role: "owner", signupDate: "2025-11-25", lastActive: "2026-02-01", verified: true, suspended: false },
];

// ─── Mock Listings ───
export const mockListings: AdminListing[] = [
  { id: "l1", title: "Sunny room in Bondi", ownerEmail: "bob@outlook.com", suburb: "Bondi", status: "active", applicants: 5, weeklyPrice: 320, createdAt: "2025-12-01" },
  { id: "l2", title: "Cozy studio near UNSW", ownerEmail: "dave@realestate.com.au", suburb: "Kensington", status: "active", applicants: 8, weeklyPrice: 280, createdAt: "2025-12-15" },
  { id: "l3", title: "Modern flat in CBD", ownerEmail: "bob@outlook.com", suburb: "Sydney CBD", status: "pending", applicants: 0, weeklyPrice: 450, createdAt: "2026-01-20" },
  { id: "l4", title: "Share house Surry Hills", ownerEmail: "henry@live.com.au", suburb: "Surry Hills", status: "active", applicants: 3, weeklyPrice: 350, createdAt: "2025-11-10" },
  { id: "l5", title: "Room in Newtown terrace", ownerEmail: "kate@hotmail.com", suburb: "Newtown", status: "active", applicants: 6, weeklyPrice: 290, createdAt: "2026-01-05" },
  { id: "l6", title: "Penthouse Darlinghurst", ownerEmail: "dave@realestate.com.au", suburb: "Darlinghurst", status: "rejected", applicants: 0, weeklyPrice: 600, createdAt: "2026-01-25" },
  { id: "l7", title: "Budget room Parramatta", ownerEmail: "frank@yahoo.com", suburb: "Parramatta", status: "active", applicants: 12, weeklyPrice: 200, createdAt: "2025-10-20" },
  { id: "l8", title: "Master bed Manly", ownerEmail: "henry@live.com.au", suburb: "Manly", status: "pending", applicants: 0, weeklyPrice: 380, createdAt: "2026-02-01" },
];

// ─── Mock Payments ───
export const mockPayments: AdminPayment[] = [
  { id: "p1", email: "bob@outlook.com", amount: 49, type: "owner_fee", date: "2026-02-01", status: "completed" },
  { id: "p2", email: "alice@gmail.com", amount: 19, type: "seeker_fee", date: "2026-01-30", status: "completed" },
  { id: "p3", email: "dave@realestate.com.au", amount: 49, type: "owner_fee", date: "2026-01-28", status: "completed" },
  { id: "p4", email: "emma@proton.me", amount: 19, type: "seeker_fee", date: "2026-01-25", status: "completed" },
  { id: "p5", email: "henry@live.com.au", amount: 49, type: "owner_fee", date: "2026-01-20", status: "pending" },
  { id: "p6", email: "kate@hotmail.com", amount: 49, type: "owner_fee", date: "2026-01-18", status: "completed" },
  { id: "p7", email: "frank@yahoo.com", amount: 49, type: "owner_fee", date: "2026-01-10", status: "refunded" },
  { id: "p8", email: "iris@student.uts.edu.au", amount: 19, type: "seeker_fee", date: "2026-01-08", status: "completed" },
];

// ─── Monthly Revenue ───
export const mockMonthlyRevenue: MonthlyRevenue[] = [
  { month: "Sep", revenue: 820 },
  { month: "Oct", revenue: 1150 },
  { month: "Nov", revenue: 1340 },
  { month: "Dec", revenue: 1562 },
  { month: "Jan", revenue: 1293 },
  { month: "Feb", revenue: 480 },
];

// ─── Revenue by role ───
export const mockRevenueByRole = [
  { name: "Owner fees", value: 3124, fill: "#f43f5e" },
  { name: "Seeker fees", value: 1748, fill: "#3b82f6" },
];

// ─── Signup Funnel ───
export const mockSignupFunnel: SignupFunnel[] = [
  { stage: "Visited", count: 2340 },
  { stage: "Signed up", count: 127 },
  { stage: "Verified", count: 89 },
  { stage: "Active listing/search", count: 54 },
  { stage: "Matched", count: 23 },
];

// ─── Page views (mock) ───
export const mockPageViews = [
  { date: "Jan 1", views: 120 },
  { date: "Jan 8", views: 185 },
  { date: "Jan 15", views: 210 },
  { date: "Jan 22", views: 245 },
  { date: "Jan 29", views: 310 },
  { date: "Feb 1", views: 290 },
];

// ─── Geographic data ───
export const mockGeoData = [
  { suburb: "Bondi", users: 18 },
  { suburb: "Sydney CBD", users: 24 },
  { suburb: "Newtown", users: 15 },
  { suburb: "Surry Hills", users: 12 },
  { suburb: "Parramatta", users: 21 },
  { suburb: "Manly", users: 9 },
  { suburb: "Kensington", users: 14 },
  { suburb: "Darlinghurst", users: 8 },
  { suburb: "Redfern", users: 6 },
];

// ─── Stats helpers ───
export const getAdminStats = () => ({
  totalUsers: 127,
  activeListings: mockListings.filter((l) => l.status === "active").length,
  totalRevenue: 4872,
  monthlyRevenue: 1293,
});

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

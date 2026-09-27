/**
 * Shapes returned by the Migrent Hub API (backend/routes_hub*.py,
 * routes_applications.py, routes_inspections.py, routes_tenancies.py).
 * Field names are the API's own; nothing is renamed on the way in.
 */

export type HubRole = "renter" | "owner" | "admin";
export type Tone = "neutral" | "info" | "success" | "warning" | "danger";

export interface HubFeatures {
  ai_listing_assist: boolean;
  payments: "off" | "test" | "live";
  renter_verification: boolean;
  fees: { currency: string; host_fee: number; host_fee_model: string; renter_verification_fee: number };
  view_as: boolean;
}

export interface VerificationSummary {
  status: "verified" | "pending" | "unverified";
  checks: { email_confirmed: boolean; phone_confirmed: boolean; government_id: "approved" | "pending" | "rejected" | "not_submitted" };
  verified_at: string | null;
  explainer_url: string;
  disclaimer: string;
}

export interface HubMe {
  id: string;
  email: string | null;
  name: string;
  avatar_url: string | null;
  public_id: string | null;
  role: HubRole | null;
  is_admin: boolean;
  owner_kind: "individual" | "property_manager" | null;
  onboarded: boolean;
  notification_prefs: { email?: Record<string, boolean> };
  owner_verification: VerificationSummary | null;
  member_since: string | null;
  features: HubFeatures;
  assurance_level: "aal1" | "aal2" | null;
  viewing_as: { admin_id: string } | null;
}

export interface Person {
  id: string;
  name: string;
  avatar_url: string | null;
  public_id?: string | null;
  member_since?: string | null;
}

export interface ListingCard {
  id: string;
  title: string;
  suburb: string | null;
  city: string | null;
  postcode: number | null;
  state: string | null;
  timezone: string;
  display_address: string;
  weekly_price: number | null;
  image: string | null;
  images: string[];
  property_type: string | null;
  place_type: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  parking: boolean | null;
  furnished: boolean | null;
  bills_included: boolean | null;
  pets_allowed: boolean | null;
  available_from: string | null;
  available_to: string | null;
  public_state: "published" | "expired" | "unavailable";
  unit_label: string | null;
  listing_purpose: "long_term" | "short_stay" | "sale";
  nearest_transport?: string | null;
  // owner view
  moderation_status?: string;
  property_id?: string | null;
  occupancy?: "vacant" | "occupied";
  occupied_until?: string | null;
  street_address?: string | null;
  // extras
  saved_at?: string;
  price_change?: number | null;
  reasons?: string[];
  status?: { label: string; tone: Tone };
  pending_applications?: number;
  upcoming_inspections?: number;
  moderation_notes?: string | null;
}

export type ApplicationStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "shortlisted"
  | "changes_requested"
  | "owner_approved"
  | "migrent_review"
  | "finalised"
  | "declined"
  | "withdrawn"
  | "not_proceeding";

export interface ApplicationSummary {
  id: string;
  status: ApplicationStatus;
  listing: ListingCard | null;
  person: Person | null;
  move_in_date: string | null;
  lease_months: number | null;
  occupants: number | null;
  submitted_at: string | null;
  updated_at: string;
  created_at: string;
  changes_requested_by: "owner" | "migrent" | null;
  unread_by_owner: boolean;
  household?: { adults?: number; children?: number; has_pets?: boolean };
  verification?: string | null;
  owner?: Person | null;
  owner_approved_at?: string | null;
}

export interface ApplicationEvent {
  id: string;
  event: string;
  label: string;
  actor_role: "renter" | "owner" | "admin" | "system";
  note: string | null;
  to_status: string | null;
  created_at: string;
}

export interface RentalHistoryEntry {
  suburb: string;
  from_month?: string | null;
  to_month?: string | null;
  weekly_rent?: number | null;
  landlord_name?: string | null;
  reason_for_leaving?: string | null;
  country?: string | null;
}

export interface Referee {
  name: string;
  relationship: string;
  email?: string | null;
  phone?: string | null;
}

export interface ApplicationSnapshot {
  name: string;
  avatar_url: string | null;
  member_since: string | null;
  intro: string | null;
  household: { adults: number; children: number; notes: string | null; has_pets: boolean; pet_details: string | null };
  employment: { status: string | null; employer: string | null; job_title: string | null; since: string | null };
  income_weekly: number | null;
  rental_history: RentalHistoryEntry[];
  first_time_renter: boolean;
  referees: Referee[];
  preferred_lease_months: number | null;
  verification: string;
  captured_at: string;
}

export interface DocumentMeta {
  id: string;
  kind: string;
  label: string | null;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  created_at?: string;
  url?: string | null;
}

export interface CompletionItem {
  key: string;
  label: string;
  done: boolean;
}

export interface Completion {
  percent: number;
  items: CompletionItem[];
  complete: boolean;
}

export interface ApplicationDetail {
  viewer: "renter" | "owner" | "admin";
  application: {
    id: string;
    status: ApplicationStatus;
    move_in_date: string | null;
    lease_months: number | null;
    occupants: number | null;
    message: string | null;
    share_income: boolean;
    submitted_at: string | null;
    owner_approved_at: string | null;
    decided_at: string | null;
    finalised_at: string | null;
    created_at: string;
    updated_at: string;
    changes_requested_by: "owner" | "migrent" | null;
  };
  listing: ListingCard | null;
  events: ApplicationEvent[];
  renter: Person | null;
  owner: Person | null;
  documents: DocumentMeta[];
  // renter view
  completion?: Completion;
  available_documents?: DocumentMeta[];
  problems?: string[];
  // owner/admin view
  snapshot?: ApplicationSnapshot | null;
  owner_notes?: { id: string; body: string; created_at: string }[];
  other_applications_with_you?: { id: string; status: ApplicationStatus; listing: ListingCard | null }[];
  allowed_actions?: string[];
}

export interface RentalProfile {
  user_id?: string;
  intro: string | null;
  preferred_move_date: string | null;
  preferred_lease_months: number | null;
  preferred_suburbs: string[];
  budget_weekly: number | null;
  bedrooms_min: number | null;
  household_adults: number;
  household_children: number;
  household_notes: string | null;
  has_pets: boolean;
  pet_details: string | null;
  employment_status: string | null;
  employer: string | null;
  job_title: string | null;
  employment_since: string | null;
  income_weekly: number | null;
  rental_history: RentalHistoryEntry[];
  first_time_renter: boolean;
  referees: Referee[];
  updated_at: string | null;
}

export interface RentalProfileResponse {
  profile: RentalProfile;
  exists: boolean;
  display_name: string;
  avatar_url: string | null;
  documents: DocumentMeta[];
  completion: Completion;
  verification: string;
}

export interface InspectionSlot {
  id: string;
  listing_id: string;
  starts_at: string;
  ends_at: string;
  capacity: number;
  booked: number;
  spaces_left: number;
  instructions: string | null;
  status: "scheduled" | "cancelled";
  listing?: ListingCard | null;
  my_booking?: { id: string; status: string } | null;
}

export interface InspectionBooking {
  id: string;
  status: "booked" | "cancelled" | "attended" | "no_show";
  note: string | null;
  slot: { id: string; starts_at: string; ends_at: string; instructions: string | null; status: string };
  listing: ListingCard | null;
  created_at: string;
  upcoming?: boolean;
}

export interface Thread {
  key: string;
  listing_id: string | null;
  other_user_id: string;
  last_message: { text: string; from_me: boolean; has_attachment: boolean; created_at: string };
  unread_count: number;
  message_count: number;
  listing: ListingCard | null;
  other: Person;
  my_side: "owner" | "renter";
  archived: boolean;
  muted: boolean;
  application: { id: string; status: ApplicationStatus } | null;
}

export interface Message {
  id: string;
  from_me: boolean;
  text: string;
  attachment_url: string | null;
  attachment_name: string | null;
  attachment_type: string | null;
  read_at: string | null;
  created_at: string;
  pending?: boolean;
  failed?: boolean;
}

export interface Conversation {
  key: string;
  listing: ListingCard | null;
  other: Person;
  other_user_id: string;
  my_side: "owner" | "renter";
  archived: boolean;
  muted: boolean;
  messages: Message[];
  has_more: boolean;
  context: {
    application: { id: string; status: ApplicationStatus; updated_at: string } | null;
    inspection: { booking_id: string; id: string; starts_at: string; ends_at: string; status: string } | null;
  };
}

export interface Template {
  id: string;
  title: string;
  body: string;
  builtin: boolean;
}

export interface SavedSearch {
  id: string;
  name: string;
  params: Record<string, string | number | boolean>;
  alert: "off" | "instant" | "daily" | "weekly";
  created_at: string;
  updated_at: string;
  last_checked_at: string | null;
  match_count: number;
  new_count: number;
  preview: ListingCard[];
}

export interface NextAction {
  kind: string;
  tone: Tone;
  title: string;
  body: string | null;
  href: string;
  starts_at?: string;
  timezone?: string;
  percent?: number;
}

export interface TenancySummary {
  id: string;
  status: "upcoming" | "active" | "ended" | "cancelled";
  start_date: string;
  end_date: string | null;
  rent_amount: number;
  rent_frequency: "weekly" | "fortnightly" | "monthly";
  bond_amount: number | null;
  application_id: string | null;
  listing: ListingCard | null;
  renter: Person | null;
  owner: Person | null;
  next_payment: RentPayment | null;
  open_maintenance: number;
  ending_soon: boolean;
}

export interface RentPayment {
  id: string;
  tenancy_id: string;
  due_date: string;
  amount_due: number;
  amount_paid: number;
  status: "due" | "paid" | "partial" | "waived";
  paid_on: string | null;
  method: string | null;
  reference: string | null;
  provider: string | null;
}

export interface EmergencyGuidance {
  lines: string[];
  authority_name: string;
  authority_url: string | null;
}

export interface TenancyDetail {
  viewer: "owner" | "renter";
  tenancy: {
    id: string;
    status: TenancySummary["status"];
    start_date: string;
    end_date: string | null;
    rent_amount: number;
    rent_frequency: TenancySummary["rent_frequency"];
    bond_amount: number | null;
    notes: string | null;
    application_id: string | null;
    created_at: string;
  };
  listing: ListingCard | null;
  renter: Person | null;
  owner: Person | null;
  payments: RentPayment[];
  ledger: { recorded_paid: number; next_payment: RentPayment | null };
  maintenance: MaintenanceSummary[];
  emergency: EmergencyGuidance;
  payments_note: string;
}

export type MaintenanceStatus = "submitted" | "acknowledged" | "scheduled" | "in_progress" | "resolved" | "closed";

export interface MaintenanceSummary {
  id: string;
  category: string;
  title: string;
  urgency: "routine" | "urgent" | "emergency";
  status: MaintenanceStatus;
  scheduled_for?: string | null;
  created_at: string;
  updated_at: string;
  tenancy_id?: string;
  photo_count?: number;
  listing?: ListingCard | null;
  renter?: Person | null;
}

export interface MaintenanceDetail {
  viewer: "owner" | "renter";
  request: MaintenanceSummary & { description: string; access_notes: string | null; resolved_at: string | null; closed_at: string | null };
  photos: string[];
  updates: { id: string; author_role: string; body: string | null; status_from: string | null; status_to: string | null; internal: boolean; created_at: string }[];
  listing: ListingCard | null;
  renter: Person | null;
  owner: Person | null;
  next_statuses: MaintenanceStatus[];
  emergency: EmergencyGuidance | null;
}

export interface PropertySummary {
  id: string;
  nickname: string | null;
  relationship: "owner" | "manager";
  street_address: string;
  suburb: string | null;
  state: string | null;
  postcode: number | null;
  property_type: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  parking_spaces: number | null;
  created_at: string;
  cover_image: string | null;
  units: ListingCard[];
  summary: { units: number; available: number; occupied: number; applications: number; inspections: number };
  tenancies?: TenancySummary[];
  performance?: Performance;
}

export interface Performance {
  days: number;
  totals: Record<"view" | "save" | "enquiry" | "inspection_booked" | "application_started" | "application_submitted" | "unique_views", number>;
  by_listing: Record<string, Record<string, number>>;
  tracking_since: string | null;
}

export interface Portfolio {
  properties: PropertySummary[];
  unassigned: ListingCard[];
  totals: { properties: number; units: number; available: number; occupied: number; applications: number; inspections: number; drafts: number };
  drafts?: DraftSummary[];
}

export interface DraftSummary {
  id: string;
  property_id: string | null;
  step: number;
  title: string;
  suburb: string | null;
  image: string | null;
  updated_at: string;
}

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  cta_url: string | null;
  entity_type: string | null;
  entity_id: string | null;
  is_read: boolean;
  created_at: string;
}

export interface RenterHome {
  role: "renter";
  next_actions: NextAction[];
  applications: ApplicationSummary[];
  inspections: InspectionBooking[];
  saved: ListingCard[];
  recommended: ListingCard[];
  messages: Thread[];
  completion: Completion;
  tenancy: TenancySummary | null;
  verification: string;
  has_activity: boolean;
}

export interface OwnerHome {
  role: "owner";
  verified: boolean;
  portfolio: { totals: Portfolio["totals"]; properties: PropertySummary[]; unassigned: ListingCard[] };
  attention: NextAction[];
  applications: ApplicationSummary[];
  inspections: InspectionSlot[];
  messages: Thread[];
  tenancies: TenancySummary[];
  insights: { days: number; totals: Performance["totals"]; tracking_since: string | null };
  drafts: number;
}

export interface HubCounts {
  messages: number;
  notifications: number;
  applications: number;
  maintenance: number;
  tenancies: number;
}

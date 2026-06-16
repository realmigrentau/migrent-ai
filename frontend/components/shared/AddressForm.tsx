import { MapPin, Phone, Shield, Mail } from "lucide-react";
import type { Profile } from "../../hooks/useProfile";

interface AddressFormProps {
  profile: Profile | null;
}

/**
 * Read-only address and contact display.
 * Address fields are set during onboarding and locked afterward.
 */
export default function AddressForm({ profile }: AddressFormProps) {
  const address =
    typeof profile?.residential_address === "string"
      ? profile.residential_address
      : profile?.residential_address?.address || "";

  return (
    <div className="space-y-6">
      {/* Residential Address */}
      <div className="card p-5 rounded-2xl">
        <div className="flex items-start gap-4 mb-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-soft)] from-blue-400 to-[var(--color-primary)] flex items-center justify-center shadow-lg shrink-0">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-[var(--color-ink)]">Residential Address</h3>
            <p className="text-xs text-[var(--color-ink-3)]">Only visible to verified users</p>
          </div>
        </div>
        <div className="ml-14 space-y-3">
          <input
            type="text"
            value={address}
            disabled
            placeholder="Set during onboarding"
            className="input-field bg-[var(--color-surface)] cursor-not-allowed"
          />
          {profile?.suburb_city && (
            <div className="flex items-center gap-2 text-sm text-[var(--color-ink-2)]">
              <span className="text-[var(--color-ink-3)]">Suburb/City:</span>
              <span>{profile.suburb_city}</span>
            </div>
          )}
          {profile?.nearest_station && (
            <div className="flex items-center gap-2 text-sm text-[var(--color-ink-2)]">
              <span className="text-[var(--color-ink-3)]">Nearest station:</span>
              <span>{profile.nearest_station}</span>
            </div>
          )}
          <p className="text-[10px] text-[var(--color-ink-3)]">Address is locked after onboarding. Contact support to change.</p>
        </div>
      </div>

      {/* Phone */}
      <div className="card p-5 rounded-2xl">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-soft)] from-[var(--color-accent)] to-[var(--color-accent)] flex items-center justify-center shadow-lg shrink-0">
            <Phone className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-[var(--color-ink)]">Phone</h3>
            <p className="text-xs text-[var(--color-ink-3)] mb-2">Set during onboarding</p>
            <input
              type="text"
              value={profile?.phone || (profile?.phones && profile.phones[0]) || ""}
              disabled
              placeholder="Not set"
              className="input-field bg-[var(--color-surface)] cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Email (read-only) */}
      <div className="card p-5 rounded-2xl">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-soft)] from-[var(--color-primary)] to-[var(--color-primary)] flex items-center justify-center shadow-lg shrink-0">
            <Mail className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-[var(--color-ink)]">Email</h3>
            <p className="text-xs text-[var(--color-ink-3)] mb-2">Your account email</p>
            <input
              type="text"
              value={profile?.email || ""}
              disabled
              className="input-field bg-[var(--color-surface)] cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      {profile?.emergency_contact && (
        <div className="card p-5 rounded-2xl">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-soft)] from-red-400 to-[var(--color-primary)] flex items-center justify-center shadow-lg shrink-0">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-[var(--color-ink)]">Emergency Contact</h3>
              <p className="text-xs text-[var(--color-ink-3)] mb-2">Set during onboarding</p>
              <div className="space-y-1 text-sm text-[var(--color-ink-2)]">
                {profile.emergency_contact.name && (
                  <p>Name: {profile.emergency_contact.name}</p>
                )}
                {profile.emergency_contact.phone && (
                  <p>Phone: {profile.emergency_contact.phone}</p>
                )}
                {profile.emergency_contact.relationship && (
                  <p>Relationship: {profile.emergency_contact.relationship}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

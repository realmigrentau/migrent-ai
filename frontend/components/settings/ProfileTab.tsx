import ProfileForm from "../shared/ProfileForm";
import type { ProfileData } from "../../hooks/useSettingsData";

interface ProfileTabProps {
  profile: ProfileData | null;
  saving: boolean;
  updateProfile: (data: Record<string, any>) => Promise<boolean>;
  uploadPhoto: (file: File) => Promise<string | null>;
  showMessage: (text: string, type: "success" | "error" | "info") => void;
}

export default function ProfileTab({
  profile,
  saving,
  updateProfile,
  uploadPhoto,
  showMessage,
}: ProfileTabProps) {
  // Bridge ProfileData (from useSettingsData) to the Profile type the shared form expects.
  // They share the same field names so we can pass directly.
  const profileAsAny = profile as any;

  return (
    <ProfileForm
      profile={profileAsAny}
      saving={saving}
      onSave={updateProfile}
      onUploadPhoto={uploadPhoto}
      showMessage={showMessage}
      seekerMode={profile?.role === "seeker"}
    />
  );
}

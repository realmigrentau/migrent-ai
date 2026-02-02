import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabase";

export default function AdminDebug() {
  const { session, user, loading } = useAuth();
  const [profileData, setProfileData] = useState<string>("loading...");

  useEffect(() => {
    if (loading || !user) return;

    const check = async () => {
      const { data, error, status } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfileData(
        JSON.stringify({ data, error, status, userId: user.id, email: user.email, user_metadata: user.user_metadata, app_metadata: user.app_metadata }, null, 2)
      );
    };
    check();
  }, [loading, user]);

  if (loading) return <p style={{ padding: 40 }}>Loading auth...</p>;
  if (!user) return <p style={{ padding: 40 }}>Not signed in.</p>;

  return (
    <div style={{ padding: 40, fontFamily: "monospace", fontSize: 13 }}>
      <h1 style={{ fontSize: 20, marginBottom: 16 }}>Admin Debug</h1>
      <pre style={{ whiteSpace: "pre-wrap", background: "#f1f5f9", padding: 16, borderRadius: 8, maxWidth: 800, overflow: "auto" }}>
        {profileData}
      </pre>
    </div>
  );
}

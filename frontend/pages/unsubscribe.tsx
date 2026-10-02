import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { MailX, MailCheck } from "lucide-react";
import StatusPage from "../components/site/StatusPage";
import { API_BASE_URL } from "../lib/apiBase";
import { hubFromSite } from "../lib/hub/routes";

/**
 * The unsubscribe link in Migrent's emails (backend/unsubscribe.py,
 * MIGRENT_MASTER_AUDIT MIG-031). It asks once before switching anything off,
 * so a mail scanner that opens links cannot unsubscribe someone by itself,
 * and works without signing in.
 */

const LABELS: Record<string, string> = {
  messages: "new messages",
  applications: "applications, bookings and reviews",
  inspections: "inspections",
  saved_searches: "saved search alerts",
  maintenance: "repairs",
  listings: "your listings",
  summaries: "summaries",
};

export default function Unsubscribe() {
  const router = useRouter();
  const q = router.query;
  const u = typeof q.u === "string" ? q.u : "";
  const g = typeof q.g === "string" ? q.g : "";
  const t = typeof q.t === "string" ? q.t : "";
  const label = LABELS[g];
  const [state, setState] = useState<"ask" | "sending" | "done" | "error">("ask");
  const [error, setError] = useState("");

  async function confirm() {
    setState("sending");
    try {
      const res = await fetch(`${API_BASE_URL}/email/unsubscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ u, g, t }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { detail?: string };
        throw new Error(data.detail || "That didn't work.");
      }
      setState("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "That didn't work.");
      setState("error");
    }
  }

  const settings = (
    <Link href={hubFromSite.path("/settings#notifications")} className="btn-secondary">
      Choose which emails you get
    </Link>
  );

  if (router.isReady && (!u || !t || !label)) {
    return (
      <StatusPage icon={<MailX className="h-7 w-7" strokeWidth={1.9} />} tone="warn" eyebrow="Unsubscribe" title="This link isn't complete.">
        <p>Open the unsubscribe link from the email again, or change which emails you get in Migrent Hub.</p>
        <div className="mt-6">{settings}</div>
      </StatusPage>
    );
  }

  if (state === "done") {
    return (
      <StatusPage icon={<MailCheck className="h-7 w-7" strokeWidth={1.9} />} tone="success" eyebrow="Unsubscribed" title="Done." actions={settings}>
        <p>You won&apos;t get emails about {label} any more. You&apos;ll still see them in Migrent Hub, and account and safety emails still reach you.</p>
      </StatusPage>
    );
  }

  return (
    <StatusPage
      icon={<MailX className="h-7 w-7" strokeWidth={1.9} />}
      tone="primary"
      eyebrow="Unsubscribe"
      title={label ? `Stop emails about ${label}?` : "Stop these emails?"}
      actions={
        <>
          <button type="button" className="btn-primary" disabled={state === "sending" || !router.isReady} onClick={() => void confirm()}>
            {state === "sending" ? "Unsubscribing" : "Unsubscribe"}
          </button>
          {settings}
        </>
      }
    >
      <p>You&apos;ll still see these in Migrent Hub. Account and safety emails are not affected.</p>
      {state === "error" && (
        <p role="alert" className="text-[var(--color-danger-500)]">
          {error}
        </p>
      )}
    </StatusPage>
  );
}

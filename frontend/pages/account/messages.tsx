import { useEffect } from "react";
import { useRouter } from "next/router";

// Redirect to new unified messages page
export default function OldMessagesRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/messages");
  }, [router]);
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-2 border-[var(--color-line-2)] border-t-[var(--color-ink)] rounded-full animate-spin" />
    </div>
  );
}

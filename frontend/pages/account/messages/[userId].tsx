import { useEffect } from "react";
import { useRouter } from "next/router";

// Redirect to new unified messages page with userId param
export default function OldChatRedirect() {
  const router = useRouter();
  const { userId } = router.query;

  useEffect(() => {
    if (router.isReady) {
      router.replace(userId ? `/messages?userId=${userId}` : "/messages");
    }
  }, [router.isReady, userId, router]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-2 border-[var(--color-line-2)] border-t-[var(--color-ink)] rounded-full animate-spin" />
    </div>
  );
}

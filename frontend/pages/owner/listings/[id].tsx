import { useEffect } from "react";
import { useRouter } from "next/router";

// Redirect to the real room detail page
export default function OwnerListingDetail() {
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      router.replace(`/listing/${id}`);
    }
  }, [id, router]);

  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-[var(--color-line-2)] dark:border-[var(--color-primary-soft)] border-t-[var(--color-ink)] rounded-full animate-spin" />
    </div>
  );
}

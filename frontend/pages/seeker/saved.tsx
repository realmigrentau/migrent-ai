import { useEffect } from "react";
import { useRouter } from "next/router";

export default function SavedRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/seeker/wishlist");
  }, [router]);

  return null;
}

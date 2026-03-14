import { useRouter } from "next/router";
import { useEffect } from "react";

export default function RoomDetailRedirect() {
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id && typeof id === "string") {
      router.replace(`/listing/${id}`);
    }
  }, [id, router]);

  return null;
}

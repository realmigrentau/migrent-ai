import { useEffect } from "react";
import { useRouter } from "next/router";

export default function AdminIndex() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/mazda.asgt22779412.sara-admin/overview");
  }, [router]);
  return null;
}

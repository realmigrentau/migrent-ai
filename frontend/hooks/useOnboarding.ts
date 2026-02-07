import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "./useAuth";
import { checkOnboardingStatus } from "../lib/api";

export function useOnboarding() {
  const router = useRouter();
  const { session, loading: authLoading } = useAuth();

  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !session) {
      setIsLoading(false);
      return;
    }

    checkStatus();
  }, [session, authLoading]);

  const checkStatus = async () => {
    if (!session) {
      setIsLoading(false);
      return;
    }

    const status = await checkOnboardingStatus(session.access_token);
    setIsCompleted(status?.onboarding_completed ?? false);
    setIsLoading(false);
  };

  // Redirect to onboarding if accessing dashboard without completion
  const requireOnboarding = (callback?: () => void) => {
    if (!isLoading && !isCompleted && !authLoading) {
      router.push("/onboarding");
    } else if (!isLoading && isCompleted && callback) {
      callback();
    }
  };

  return {
    isCompleted,
    isLoading,
    requireOnboarding,
    checkStatus,
  };
}

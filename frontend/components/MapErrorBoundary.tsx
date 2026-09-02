import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Rendered in place of the map when it throws. */
  fallback: ReactNode;
  /** Called once per failure so the page can switch to list-only mode. */
  onError?: (error: Error) => void;
}

interface State {
  failed: boolean;
}

/**
 * Isolates the map from the rest of the search page.
 *
 * Anything MapLibre throws (WebGL init, a style that fails to load, a tile
 * worker that dies) stops here. The results list, filters and pagination
 * keep working; the map area shows a plain "Map unavailable" panel.
 */
export default class MapErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error);
    // Report without user data: the error and the component stack only.
    reportMapFailure(error, info.componentStack ?? undefined);
  }

  render() {
    if (this.state.failed) return this.props.fallback;
    return this.props.children;
  }
}

/**
 * Send a map failure to error monitoring, if configured. Sentry is loaded
 * lazily so pages that never fail do not pay for it, and nothing about the
 * viewer (query, session, location) is attached.
 */
export function reportMapFailure(error: unknown, componentStack?: string) {
  if (typeof window === "undefined") return;
  const err = error instanceof Error ? error : new Error(String(error));
  console.warn("[MigRent] Map unavailable:", err.message);
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return;
  import("@sentry/nextjs")
    .then((Sentry) => {
      Sentry.withScope((scope) => {
        scope.setTag("feature", "search-map");
        scope.setLevel("warning");
        if (componentStack) scope.setContext("react", { componentStack });
        Sentry.captureException(err);
      });
    })
    .catch(() => {
      /* monitoring is best-effort */
    });
}

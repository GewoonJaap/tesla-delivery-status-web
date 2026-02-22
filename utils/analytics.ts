
import * as Sentry from "@sentry/react";

export const trackEvent = (
  eventName: string,
  params?: Record<string, string | number | boolean | undefined>
) => {
  try {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, params);
    }
  } catch (e) {
    console.warn("Analytics tracking error:", e);
    Sentry.captureException(e);
  }
};

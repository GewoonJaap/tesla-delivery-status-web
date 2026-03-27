
import * as Sentry from "@sentry/react";

const GA_MEASUREMENT_ID = 'G-YKL37ZRJWG';

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

/**
 * Signals to Google Analytics that the user has requested data deletion.
 */
export const deleteUserData = () => {
  try {
    trackEvent('user_data_deletion', {
      timestamp: new Date().toISOString(),
      reason: 'user_request'
    });
  } catch (e) {
    console.warn("Error during analytics data deletion signal:", e);
    Sentry.captureException(e);
  }
};

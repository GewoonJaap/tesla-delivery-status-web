import * as Sentry from "@sentry/react";
import { TESLA_STATUS_API_URL } from '../constants';
import { UserPreferences } from '../types';

const PREFERENCES_KEY = 'tesla-user-preferences';

export function getUserPreferences(): UserPreferences {
  try {
    const stored = localStorage.getItem(PREFERENCES_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load user preferences:', e);
  }
  return { dataCollectionOptIn: null };
}

export function setUserPreferences(prefs: UserPreferences): void {
  try {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs));
  } catch (e) {
    console.error('Failed to save user preferences:', e);
  }
}

export async function syncTeslaOrder(referenceNumber: string, accessToken: string): Promise<void> {
  const prefs = getUserPreferences();
  
  if (prefs.dataCollectionOptIn !== true) {
    // User has not opted in or explicitly opted out
    return;
  }

  if (!accessToken) {
    console.warn('No access token provided for Tesla Status API sync.');
    return;
  }

  try {
    const response = await fetch(`${TESLA_STATUS_API_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        referenceNumber,
        source: 'Webapp',
      }),
    });

    if (!response.ok) {
      // Silent failure as requested, but log to Sentry for debugging
      const errorMsg = `Tesla Status API sync failed for ${referenceNumber}: ${response.status} ${response.statusText}`;
      console.warn(errorMsg);
      Sentry.captureMessage(errorMsg, {
        level: 'warning',
        extra: { referenceNumber, status: response.status, statusText: response.statusText }
      });
      return;
    }

    const data = await response.json();
    console.log(`Tesla Status API sync successful for ${referenceNumber}:`, data.message);
  } catch (error) {
    // Silent failure as requested, but log to Sentry for debugging
    console.warn(`Tesla Status API sync error for ${referenceNumber}:`, error);
    Sentry.captureException(error, {
      extra: { referenceNumber }
    });
  }
}

/**
 * Deletes a specific order from the estimation database.
 */
export async function deleteTeslaOrder(rn: string, accessToken: string): Promise<{ success: boolean; message?: string }> {
  console.log(`Attempting to delete order ${rn} from estimations...`);
  try {
    const response = await fetch(`${TESLA_STATUS_API_URL}/api/orders/${rn}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (response.status === 404) {
      return { success: true, message: `Order ${rn} was not found, but is now cleared.` };
    }

    if (!response.ok) {
      throw new Error(`Failed to delete order: ${response.statusText}`);
    }

    return { success: true, message: `Order ${rn} removed from estimations successfully.` };
  } catch (error) {
    console.error('Error deleting Tesla order:', error);
    Sentry.captureException(error, {
      extra: { rn }
    });
    return { success: false, message: `Failed to remove order ${rn}. Please try again later.` };
  }
}

/**
 * Donates anonymized order data for diagnostic purposes.
 */
export async function donateTeslaOrder(rn: string, accessToken: string): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch(`${TESLA_STATUS_API_URL}/api/orders/${rn}/donate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (response.status === 429) {
      return { success: false, message: 'Rate limit exceeded. You can only donate once per hour.' };
    }

    if (!response.ok) {
      throw new Error(`Failed to donate order: ${response.statusText}`);
    }

    const data = await response.json();
    return { success: true, message: data.message || 'Thank you for donating your order data!' };
  } catch (error) {
    console.error('Error donating Tesla order:', error);
    Sentry.captureException(error, {
      extra: { rn }
    });
    return { success: false, message: 'An error occurred while donating your order data.' };
  }
}

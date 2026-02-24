import { CombinedOrder, OrderDiff } from "../types";
import * as Sentry from "@sentry/react";

// --- PKCE Helpers ---

function base64urlencode(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function generateCodeVerifier(): string {
  const randomBytes = new Uint8Array(32);
  crypto.getRandomValues(randomBytes);
  return base64urlencode(randomBytes.buffer);
}

export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return base64urlencode(digest);
}

// --- Token Helpers ---

function decodeJwt(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Failed to decode JWT", e);
    Sentry.captureException(e);
    return null;
  }
}

export function isTokenValid(accessToken: string): boolean {
    const decoded = decodeJwt(accessToken);
    if (!decoded || !decoded.exp) {
        return false;
    }
    // Check if expiry time is in the future (with a 60-second buffer)
    return decoded.exp > (Date.now() / 1000) + 60;
}

// --- Storage Helpers ---

/**
 * Safely sets an item in localStorage, catching QuotaExceededError.
 * Returns true if successful, false otherwise.
 */
export function safeLocalStorageSetItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e: any) {
    // Check if the error is a QuotaExceededError
    const isQuotaError = 
      e instanceof DOMException && (
        e.code === 22 || 
        e.code === 1014 || 
        e.name === 'QuotaExceededError' || 
        e.name === 'NS_ERROR_DOM_QUOTA_REACHED'
      );
    
    if (isQuotaError) {
      console.warn(`LocalStorage quota exceeded while saving key: ${key}. Consider clearing some data.`);
      Sentry.captureException(e);
    } else {
      console.error(`An error occurred while saving to LocalStorage: ${key}`, e);
      Sentry.captureException(e);
    }
    return false;
  }
}

// --- Comparison Helpers ---

function isObject(obj: any): obj is object {
    return obj !== null && typeof obj === 'object' && !Array.isArray(obj);
}

// Helper to compare arrays. Using JSON.stringify is a pragmatic choice for this app's data.
// It's fast and handles nested structures, but is sensitive to property order in objects.
const areArraysEqual = (a: any[], b: any[]): boolean => {
    if (a.length !== b.length) {
        return false;
    }
    // This is a quick way to compare arrays of primitives or simple objects.
    // It will consider arrays with same elements but different order as different.
    return JSON.stringify(a) === JSON.stringify(b);
};

export function compareObjects(oldObj: any, newObj: any, path: string = '', diffs: OrderDiff = {}): OrderDiff {
    const a = oldObj || {};
    const b = newObj || {};

    const allKeys = new Set([...Object.keys(a), ...Object.keys(b)]);

    for (const key of allKeys) {
        const currentPath = path ? `${path}.${key}` : key;
        const oldVal = a[key];
        const newVal = b[key];

        if (Object.is(oldVal, newVal)) {
            continue; // Values are strictly equal, no change.
        }

        if (isObject(oldVal) && isObject(newVal)) {
            compareObjects(oldVal, newVal, currentPath, diffs);
        } else if (Array.isArray(oldVal) && Array.isArray(newVal)) {
            if (!areArraysEqual(oldVal, newVal)) {
                diffs[currentPath] = { old: oldVal, new: newVal };
            }
        } else {
            // This covers primitives, nulls, undefined, and type mismatches (e.g., object vs. array).
            // The Object.is check at the top has already filtered out identical values, so if we're here, it's a difference.
            diffs[currentPath] = { old: oldVal, new: newVal };
        }
    }
    return diffs;
}

export function filterIgnoredDiffs(diff: OrderDiff): OrderDiff {
    const ignoredKeys = ['requestHelp'];
    const filteredDiff = { ...diff };

    Object.keys(filteredDiff).forEach(key => {
        if (ignoredKeys.some(ignoredKey => key.includes(ignoredKey))) {
            delete filteredDiff[key];
        }
    });

    return filteredDiff;
}

export function compareOrders(oldOrders: CombinedOrder[], newOrders: CombinedOrder[]): Record<string, OrderDiff> {
    const allDiffs: Record<string, OrderDiff> = {};
    const newOrdersMap = new Map(newOrders.map(o => [o.order.referenceNumber, o]));

    for (const oldOrder of oldOrders) {
        const rn = oldOrder.order.referenceNumber;
        const newOrder = newOrdersMap.get(rn);
        if (newOrder) {
            const orderDiffs = compareObjects(oldOrder, newOrder);
            if(Object.keys(orderDiffs).length > 0) {
                allDiffs[rn] = orderDiffs;
            }
        }
    }
    return allDiffs;
}
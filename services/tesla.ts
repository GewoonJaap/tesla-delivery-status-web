
import { TeslaTokens, TeslaOrder, OrderDetails, CombinedOrder } from '../types';
import * as Sentry from "@sentry/react";
import {
  CLIENT_ID,
  REDIRECT_URI,
  AUTH_URL,
  SCOPE,
  CODE_CHALLENGE_METHOD,
  ORDERS_API_URL,
  ORDER_DETAILS_API_URL_TEMPLATE,
  PROXY_API_URL,
} from '../constants';
import { generateCodeVerifier, generateCodeChallenge } from '../utils/helpers';

// Custom error for handling expired tokens
export class TokenExpiredError extends Error {
  constructor(message = 'Access token is expired') {
    super(message);
    this.name = 'TokenExpiredError';
  }
}

// --- Authentication Flow ---

export async function handleTeslaLogin(): Promise<string> {
  const state = btoa(crypto.randomUUID());
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  sessionStorage.setItem('tesla-code-verifier', codeVerifier);
  sessionStorage.setItem('tesla-auth-state', state);

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: SCOPE,
    state: state,
    code_challenge: codeChallenge,
    code_challenge_method: CODE_CHALLENGE_METHOD,
  });

  const authUrl = `${AUTH_URL}?${params.toString()}`;
  window.open(authUrl, '_blank', 'noopener,noreferrer');
  
  return authUrl;
}

export async function exchangeCodeForTokens(code: string, codeVerifier: string): Promise<TeslaTokens> {
    const body = {
        grant_type: 'authorization_code',
        code,
        codeVerifier,
    };

    const response = await fetch(PROXY_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(`Failed to exchange code for token: ${data.error_description || data.error || response.statusText}`);
    }
    return data;
}

export async function refreshAccessToken(refreshToken: string): Promise<TeslaTokens> {
    const body = {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
    };

    const response = await fetch(PROXY_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(`Failed to refresh token: ${data.error_description || data.error || response.statusText}`);
    }
    return data;
}


// --- API Data Fetching ---

async function proxyApiRequest(url: string, accessToken: string) {
    const response = await fetch(PROXY_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            action: 'proxy',
            targetUrl: url,
            accessToken: accessToken,
        }),
    });
    
    // Specifically handle 401 Unauthorized errors for token refresh logic
    if (response.status === 401) {
        const errorData = await response.json().catch(() => ({ error: 'Unauthorized' }));
        throw new TokenExpiredError(`API request failed with 401: ${errorData.error_description || errorData.error || 'Unauthorized'}`);
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Could not parse error response from proxy' }));
        throw new Error(`API request failed via proxy with status ${response.status}: ${errorData.error_description || errorData.error || response.statusText}`);
    }
    return response.json();
}

async function getOrders(accessToken: string): Promise<TeslaOrder[]> {
    const data = await proxyApiRequest(ORDERS_API_URL, accessToken);
    // The main orders API wraps its list in a `response` object.
    return data.response;
}

async function getOrderDetails(orderId: string, accessToken: string): Promise<OrderDetails> {
    const url = ORDER_DETAILS_API_URL_TEMPLATE.replace('{ORDER_ID}', orderId);
    // The details API returns the data object directly.
    return await proxyApiRequest(url, accessToken);
}

export async function getAllOrderData(accessToken: string): Promise<CombinedOrder[]> {
    const basicOrders = await getOrders(accessToken);
    if (!basicOrders || basicOrders.length === 0) {
        return [];
    }
    
    const detailedOrdersPromises = basicOrders.map(async (order) => {
        try {
            const details = await getOrderDetails(order.referenceNumber, accessToken);
            return { order, details };
        } catch (error: any) {
            console.error(`Failed to fetch details for order ${order.referenceNumber}`, error);
            Sentry.captureException(error);
            // Return basic order with empty details to prevent app crash and show what we have
            return { 
                order, 
                details: { tasks: {} } 
            };
        }
    });

    return Promise.all(detailedOrdersPromises);
}
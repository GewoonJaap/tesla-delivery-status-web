// Cloudflare worker source file

// --- Constants ---
const CLIENT_ID = 'ownerapi';
const REDIRECT_URI = 'https://auth.tesla.com/void/callback';
const TOKEN_URL = 'https://auth.tesla.com/oauth2/v3/token';

// --- Helper for CORS Responses ---
function createJsonResponse(body, status, extraHeaders = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*', // Allow any origin
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    ...extraHeaders,
  };
  return new Response(JSON.stringify(body), { status, headers });
}

// --- Cloudflare Worker Export ---
export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    // Restrict to POST requests for functional calls
    if (request.method !== 'POST') {
      return createJsonResponse({ error: 'Method Not Allowed' }, 405, { 'Allow': 'POST, OPTIONS' });
    }

    try {
      const body = await request.json();

      // --- Handle Authentication Requests ---
      if ('grant_type' in body) {
        let requestBody;

        if (body.grant_type === 'authorization_code') {
          if (!body.code || !body.codeVerifier) {
            return createJsonResponse(
              { error: 'Missing code or codeVerifier for authorization_code grant' },
              400
            );
          }
          requestBody = new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: CLIENT_ID,
            code: body.code,
            redirect_uri: REDIRECT_URI,
            code_verifier: body.codeVerifier,
          });
        } else if (body.grant_type === 'refresh_token') {
          if (!body.refresh_token) {
            return createJsonResponse(
              { error: 'Missing refresh_token for refresh_token grant' },
              400
            );
          }
          requestBody = new URLSearchParams({
            grant_type: 'refresh_token',
            client_id: CLIENT_ID,
            refresh_token: body.refresh_token,
          });
        } else {
          return createJsonResponse({ error: 'Invalid grant_type specified' }, 400);
        }

        const teslaResponse = await fetch(TOKEN_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: requestBody,
        });
        const data = await teslaResponse.json();
        return createJsonResponse(data, teslaResponse.status);
      }

      // --- Handle General API Proxy Requests ---
      if ('action' in body && body.action === 'proxy') {
        if (!body.targetUrl || !body.accessToken) {
          return createJsonResponse(
            { error: 'Missing targetUrl or accessToken for proxy action' },
            400
          );
        }

        const apiResponse = await fetch(body.targetUrl, {
          headers: {
            'Authorization': `Bearer ${body.accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (apiResponse.status === 204) {
          return createJsonResponse({}, 204);
        }

        const data = await apiResponse.json();
        return createJsonResponse(data, apiResponse.status);
      }

      return createJsonResponse({ error: 'Invalid request body or action specified' }, 400);
    } catch (error) {
      console.error('Proxy handler error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return createJsonResponse(
        { error: 'Internal Server Error in proxy', details: errorMessage },
        500
      );
    }
  },
};
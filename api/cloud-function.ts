const functions = require('@google-cloud/functions-framework');

// --- Constants ---
const CLIENT_ID = 'ownerapi';
const REDIRECT_URI = 'https://auth.tesla.com/void/callback';
const TOKEN_URL = 'https://auth.tesla.com/oauth2/v3/token';

// --- Helper for CORS ---
function sendJson(res, body, status = 200, extra = {}) {
  res.set({
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    ...extra,
  });
  return res.status(status).send(JSON.stringify(body));
}

// --- Cloud Function ---
functions.http('teslaProxy', async (req, res) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.set({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    return res.status(204).send();
  }

  // Only POST allowed
  if (req.method !== 'POST') {
    return sendJson(res, { error: 'Method Not Allowed' }, 405, {
      Allow: 'POST, OPTIONS',
    });
  }

  try {
    const body = req.body || {};

    // --- AUTH TOKEN EXCHANGE ---
    if ('grant_type' in body) {
      let params;

      if (body.grant_type === 'authorization_code') {
        if (!body.code || !body.codeVerifier) {
          return sendJson(res, {
            error: 'Missing code or codeVerifier for authorization_code grant'
          }, 400);
        }

        params = new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: CLIENT_ID,
          code: body.code,
          redirect_uri: REDIRECT_URI,
          code_verifier: body.codeVerifier,
        });
      }

      else if (body.grant_type === 'refresh_token') {
        if (!body.refresh_token) {
          return sendJson(res, {
            error: 'Missing refresh_token for refresh_token grant'
          }, 400);
        }

        params = new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: CLIENT_ID,
          refresh_token: body.refresh_token,
        });
      }

      else {
        return sendJson(res, { error: 'Invalid grant_type specified' }, 400);
      }

      const teslaRes = await fetch(TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params,
      });

      const data = await teslaRes.json();
      return sendJson(res, data, teslaRes.status);
    }

    // --- PROXY REQUEST ---
    if (body.action === 'proxy') {
      if (!body.targetUrl || !body.accessToken) {
        return sendJson(res, {
          error: 'Missing targetUrl or accessToken for proxy action'
        }, 400);
      }

      const apiRes = await fetch(body.targetUrl, {
        headers: {
          Authorization: `Bearer ${body.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (apiRes.status === 204) {
        return sendJson(res, {}, 204);
      }

      const data = await apiRes.json();
      return sendJson(res, data, apiRes.status);
    }

    return sendJson(res, { error: 'Invalid request body or action specified' }, 400);

  } catch (err) {
    console.error('Proxy handler error:', err);
    return sendJson(res, {
      error: 'Internal Server Error in proxy',
      details: err.message,
    }, 500);
  }
});

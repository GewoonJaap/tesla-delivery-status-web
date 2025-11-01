import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const PORT = 8787;

const CLIENT_ID = 'ownerapi';
const REDIRECT_URI = 'https://auth.tesla.com/void/callback';
const TOKEN_URL = 'https://auth.tesla.com/oauth2/v3/token';

app.use(cors());
app.use(express.json());

interface AuthCodeBody {
  grant_type: 'authorization_code';
  code: string;
  codeVerifier: string;
}

interface RefreshTokenBody {
  grant_type: 'refresh_token';
  refresh_token: string;
}

interface ProxyBody {
  action: 'proxy';
  targetUrl: string;
  accessToken: string;
}

type RequestBody = AuthCodeBody | RefreshTokenBody | ProxyBody;

app.post('/', async (req: Request<{}, {}, RequestBody>, res: Response) => {
  try {
    const body = req.body;

    // Handle Authentication Requests
    if ('grant_type' in body) {
      let requestBody: URLSearchParams;

      if (body.grant_type === 'authorization_code') {
        if (!body.code || !body.codeVerifier) {
          return res.status(400).json({
            error: 'Missing code or codeVerifier for authorization_code grant',
          });
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
          return res.status(400).json({
            error: 'Missing refresh_token for refresh_token grant',
          });
        }
        requestBody = new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: CLIENT_ID,
          refresh_token: body.refresh_token,
        });
      } else {
        return res.status(400).json({ error: 'Invalid grant_type specified' });
      }

      const teslaResponse = await fetch(TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: requestBody,
      });
      const data = await teslaResponse.json();
      return res.status(teslaResponse.status).json(data);
    }

    // Handle General API Proxy Requests
    if ('action' in body && body.action === 'proxy') {
      if (!body.targetUrl || !body.accessToken) {
        return res.status(400).json({
          error: 'Missing targetUrl or accessToken for proxy action',
        });
      }

      const apiResponse = await fetch(body.targetUrl, {
        headers: {
          Authorization: `Bearer ${body.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (apiResponse.status === 204) {
        return res.status(204).json({});
      }

      const data = await apiResponse.json();
      return res.status(apiResponse.status).json(data);
    }

    return res.status(400).json({ error: 'Invalid request body or action specified' });
  } catch (error) {
    console.error('Proxy handler error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return res.status(500).json({
      error: 'Internal Server Error in proxy',
      details: errorMessage,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Tesla proxy server running on http://localhost:${PORT}`);
});

/**
 * Vercel Serverless Function — Meta Conversions API (CAPI)
 *
 * Receives events from the client-side tracking utility and forwards them
 * to Meta's Conversions API for server-side event tracking.
 *
 * Environment variables required:
 *   META_CAPI_ACCESS_TOKEN  — Generate from Meta Events Manager → Settings → Generate Access Token
 *   META_PIXEL_ID           — Your Meta Pixel ID (993503079134900)
 *
 * Endpoint: POST /api/meta-capi
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

const PIXEL_ID = process.env.META_PIXEL_ID || '993503079134900';
const ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN || '';
const GRAPH_API_VERSION = 'v21.0';
const GRAPH_URL = `https://graph.facebook.com/${GRAPH_API_VERSION}/${PIXEL_ID}/events`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Guard: CAPI access token must be configured
  if (!ACCESS_TOKEN) {
    console.warn('[meta-capi] META_CAPI_ACCESS_TOKEN is not set. Skipping CAPI send.');
    return res.status(200).json({ ok: true, skipped: true, reason: 'no_access_token' });
  }

  try {
    const body = req.body;

    // Basic validation
    if (!body?.event_name || !body?.event_id) {
      return res.status(400).json({ error: 'Missing event_name or event_id' });
    }

    // Build the CAPI event payload
    const event: Record<string, any> = {
      event_name: body.event_name,
      event_time: body.event_time || Math.floor(Date.now() / 1000),
      event_id: body.event_id,
      action_source: body.action_source || 'website',
      event_source_url: body.event_source_url || '',
      user_data: {},
      custom_data: body.custom_data || {},
    };

    // Map user data fields (PII fields are already SHA-256 hashed on the client)
    const ud = body.user_data || {};
    if (ud.fbp) event.user_data.fbp = ud.fbp;
    if (ud.fbc) event.user_data.fbc = ud.fbc;
    if (ud.client_user_agent) event.user_data.client_user_agent = ud.client_user_agent;
    if (ud.em) event.user_data.em = ud.em;              // hashed email
    if (ud.ph) event.user_data.ph = ud.ph;              // hashed phone
    if (ud.fn) event.user_data.fn = ud.fn;              // hashed first name
    if (ud.ln) event.user_data.ln = ud.ln;              // hashed last name
    if (ud.country) event.user_data.country = ud.country; // hashed ISO-2 country
    if (ud.external_id) event.user_data.external_id = ud.external_id; // hashed anonymous ID

    // Add server-side IP (from Vercel request headers)
    const clientIp =
      req.headers['x-forwarded-for']?.toString().split(',')[0]?.trim() ||
      req.headers['x-real-ip']?.toString() ||
      req.socket?.remoteAddress || '';
    if (clientIp) {
      event.user_data.client_ip_address = clientIp;
    }

    // Send to Meta's Conversions API
    const metaResponse = await fetch(GRAPH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: [event],
        access_token: ACCESS_TOKEN,
      }),
    });

    const metaData = await metaResponse.json();

    if (!metaResponse.ok) {
      console.error('[meta-capi] Meta API error:', JSON.stringify(metaData));
      return res.status(502).json({
        error: 'Meta API error',
        details: metaData,
      });
    }

    return res.status(200).json({
      ok: true,
      events_received: metaData.events_received,
      fbtrace_id: metaData.fbtrace_id,
    });

  } catch (err: any) {
    console.error('[meta-capi] Internal error:', err?.message || err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

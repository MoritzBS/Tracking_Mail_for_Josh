// Netlify Function: netlify/functions/track.js
// Purpose: Proxy requests from the browser to the DHL Tracking API using a secure server-side API key.
// Configure the Netlify environment variable DHL_API_KEY with your DHL API key.

exports.handler = async function (event) {
  try {
    const params = event.queryStringParameters || {};
    const trackingNumber = params.number || params.trackingNumber || '';
    if (!trackingNumber) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'missing tracking number' })
      };
    }

    const DHL_KEY = process.env.DHL_API_KEY;
    if (!DHL_KEY) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'DHL API key not configured on server' })
      };
    }

    const endpoint = `https://api-eu.dhl.com/track/shipments?trackingNumber=${encodeURIComponent(trackingNumber)}`;

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        // DHL docs show 'DHL-API-Key' header in examples; if your key uses a different scheme, update here.
        'DHL-API-Key': DHL_KEY
      }
    });

    const text = await response.text();

    // Try to parse JSON, but return raw text if parsing fails
    let body;
    try { body = JSON.parse(text); } catch (e) { body = { raw: text }; }

    return {
      statusCode: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify(body)
    };
  } catch (err) {
    return {
      statusCode: 502,
      body: JSON.stringify({ error: err.message })
    };
  }
};

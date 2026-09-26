const SECURE_TOKEN_URL = "https://securetoken.googleapis.com/v1/token";
const API_KEY = process.env.AM_API_KEY || "AIzaSyDtG1AU22ErnQD60AzBAcaknySiz9_CEq0";

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ ok: false, why: "method not allowed" }) };
  }

  let refresh_token;
  try {
    refresh_token = JSON.parse(event.body || "{}").refresh_token;
  } catch (e) {}

  if (!refresh_token) {
    return {
      statusCode: 400,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ok: false, why: "refresh_token kosong" })
    };
  }

  try {
    const r = await fetch(`${SECURE_TOKEN_URL}?key=${API_KEY}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ grant_type: "refresh_token", refresh_token })
    });
    const txt = await r.text();
    if (!r.ok) {
      return {
        statusCode: 200,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ok: false, why: txt.slice(0, 300) })
      };
    }
    const d = JSON.parse(txt);
    return {
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ok: true,
        id_token: d.id_token,
        refresh_token: d.refresh_token
      })
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ok: false, why: String(e) })
    };
  }
};
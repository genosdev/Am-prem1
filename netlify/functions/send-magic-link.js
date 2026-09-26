const IDT_BASE = "https://www.googleapis.com/identitytoolkit/v3/relyingparty";
const API_KEY = process.env.AM_API_KEY || "AIzaSyDtG1AU22ErnQD60AzBAcaknySiz9_CEq0";

function randIP() {
  return `${1 + Math.floor(Math.random() * 254)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${1 + Math.floor(Math.random() * 254)}`;
}

function spoofHeaders(h) {
  return {
    ...h,
    "x-forwarded-for": randIP(),
    "x-real-ip": randIP(),
    "client-ip": randIP(),
    "x-client-ip": randIP(),
    "x-originating-ip": randIP(),
    "x-cluster-client-ip": randIP()
  };
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ ok: false, why: "method not allowed" }) };
  }

  let email;
  try {
    email = JSON.parse(event.body || "{}").email;
  } catch (e) {}

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return {
      statusCode: 400,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ok: false, why: "email tidak valid" })
    };
  }

  const url = `${IDT_BASE}/getOobConfirmationCode?key=${API_KEY}`;
  const payload = {
    requestType: 6,
    email,
    androidInstallApp: true,
    canHandleCodeInApp: true,
    continueUrl: "https://alightcreative.com?ui_sid=0366624874&ui_sd=0",
    iosBundleId: "com.alightcreative.motion",
    androidPackageName: "com.alightcreative.motion",
    androidMinimumVersion: "585",
    clientType: "CLIENT_TYPE_ANDROID"
  };

  const headers = spoofHeaders({
    "content-type": "application/json",
    "x-android-package": "com.alightcreative.motion",
    "x-android-cert": "ECA6BF91B8715A6F810ED0BBFC65B6CD578F52A8",
    "user-agent": "dalvik/2.1.0 (linux; u; android 15; 23127pn0oc build/bp1a.250505.005)"
  });

  try {
    const r = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload)
    });
    const txt = await r.text();
    if (r.ok) {
      return {
        statusCode: 200,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ok: true })
      };
    }
    return {
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ok: false, why: txt.slice(0, 300) })
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ok: false, why: String(e) })
    };
  }
};
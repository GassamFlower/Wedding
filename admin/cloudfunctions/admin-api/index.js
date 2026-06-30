const ADMIN_SECRET = "DaxiAdmin2026";

function httpRes(data, sc) {
  return {
    isBase64Encoded: false,
    statusCode: sc || (data.code === 0 ? 200 : 400),
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type,Authorization", "Access-Control-Allow-Methods": "POST,OPTIONS" },
    body: JSON.stringify(data)
  };
}

exports.main = async (event) => {
  if (event && event.method === "OPTIONS") return httpRes({ code: 0 }, 200);
  let p = event;
  if (event && typeof event.body === "string") { try { p = JSON.parse(event.body); } catch(e) { p = {}; } }
  const s = p.password || p.secret;
  if (p.action === "ping") return httpRes({ code: 0, data: { msg: "pong" } });
  if (s !== ADMIN_SECRET) return httpRes({ code: 403, msg: "无权限" }, 403);
  if (p.action === "login" || p.action === "checkIsAdmin") return httpRes({ code: 0, data: { isAdmin: true } });
  if (p.action === "logout") return httpRes({ code: 0, data: { loggedOut: true } });
  return httpRes({ code: -1, msg: "未知: " + p.action });
};

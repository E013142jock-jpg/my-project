// netlify/edge-functions/protect-and-redirect.js

export default async (request, context) => {
  const userAgent = request.headers.get("user-agent") || "";
  const clientIP = context.ip;
  const url = new URL(request.url);

  // 1. Bot User-Agents to block (Extracted from your list)
  const blockedAgents = [
    "googlebot", "BlackWidow", "ChinaClaw", "Custo", "DISCo", "Download Demon",
    "eCatch", "EirGrabber", "EmailSiphon", "EmailWolf", "Express WebPictures",
    "ExtractorPro", "EyeNetIE", "FlashGet", "GetRight", "GetWeb!", "Go!Zilla",
    "Go-Ahead-Got-It", "GrabNet", "Grafula", "HMView", "HTTrack", "Indy Library"
  ];

  const isBot = blockedAgents.some(agent => 
    userAgent.toLowerCase().includes(agent.toLowerCase())
  );

  // 2. Specific IPs to block (Extracted from your htaccess)
  const blockedIPs = [
    "89.207.18.182", "173.194.69.147", "149.3.176.145", "66.235.156.128",
    "173.194.69.125", "173.194.69.120", "173.0.88.2", "2.20.6.85"
  ];

  // Logic: Block if Bot or Blocked IP
  if (isBot || blockedIPs.includes(clientIP)) {
    console.log(`Blocked: ${clientIP} - ${userAgent}`);
    return new Response("Access Denied", { status: 403 });
  }

  // 3. Redirect to your landing page if they aren't there already
  // Replace '/landing-page' with your actual path (e.g., '/welcome' or '/index.html')
  if (url.pathname === "/" || url.pathname === "/index.php") {
    return Response.redirect(new URL("/landing-page", request.url), 302);
  }

  // Allow the request to continue if they are already on the landing page
  return; 
};

export const config = {
  path: "/*", // Run this logic on every request to the site
};

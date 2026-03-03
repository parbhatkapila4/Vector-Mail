const secretKey = process.env.CLERK_SECRET_KEY;
const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

if (!secretKey) {
  console.error("Set CLERK_SECRET_KEY in .env");
  process.exit(1);
}

const base = baseUrl.replace(/\/$/, "");
const urls = [`${base}/sign-in/sso-callback`, `${base}/auth/set-session`];

const apiBase = "https://api.clerk.com/v1";

for (const url of urls) {
  try {
    const res = await fetch(`${apiBase}/redirect_urls`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });
    if (res.ok) {
      console.log("Added:", url);
    } else {
      const text = await res.text();
      if (
        res.status === 422 &&
        (text.includes("already") || text.includes("duplicate"))
      ) {
        console.log("Already exists:", url);
      } else {
        console.error("Failed", res.status, url, text);
      }
    }
  } catch (e) {
    console.error("Error adding", url, e.message);
  }
}

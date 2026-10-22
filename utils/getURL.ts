const IS_SERVER = typeof window === "undefined";
export default function getURL(path: string): URL {
    let serverUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL;
    if (serverUrl && !serverUrl.startsWith("http")) {
        serverUrl = `https://${serverUrl}`;
    }
    const baseURL = IS_SERVER ? (serverUrl || "http://localhost:3000") : window.location.origin;
    return new URL(path, baseURL)
}

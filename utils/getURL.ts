const IS_SERVER = typeof window === "undefined";
export default function getURL(path: string): URL {
    const serverUrl = process.env.NEXT_PUBLIC_SITE_URL
        ? process.env.NEXT_PUBLIC_SITE_URL
        : process.env.VERCEL_URL
    const baseURL = IS_SERVER ? serverUrl : window.location.origin;
    return new URL(path, baseURL)
}

const IS_SERVER = typeof window === "undefined";
export default function getBaseURL(path: string): URL {
    const baseURL = IS_SERVER
        ? (process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL)
        : window.location.origin;
    return new URL(path, baseURL)
}

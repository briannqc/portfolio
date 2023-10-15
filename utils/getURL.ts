const IS_SERVER = typeof window === "undefined";
export default function getURL(path: string): URL {
    console.log(`process.env.NEXT_PUBLIC_SITE_URL: ${process.env.NEXT_PUBLIC_SITE_URL}`)
    console.log(`process.env.VERCEL_URL: ${process.env.VERCEL_URL}`)
    const serverUrl = process.env.NEXT_PUBLIC_SITE_URL
        ? process.env.NEXT_PUBLIC_SITE_URL
        : `https://${process.env.VERCEL_URL}`

    console.log(`serverUrl: ${serverUrl}`)

    const baseURL = IS_SERVER ? serverUrl : window.location.origin;

    console.log(`baseURL: ${baseURL}`)
    return new URL(path, baseURL)
}

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            { protocol: "https", hostname: "vtv.mediacdn.vn" },
            { protocol: "https", hostname: "video-thumbs.mediacdn.vn" },
            { protocol: "https", hostname: "test-vtv.mediacdn.vn" }
        ]
    }
}

module.exports = nextConfig

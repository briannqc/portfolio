import {cookies} from 'next/headers'
import getBaseURL from "@/utils/getBaseURL";
import VideoList from "@/app/vietnam-history/components/video-list";
import {Video} from "@/app/api/v1/vietnam-history/models";

export default async function WatchNext() {
    const lastWatchedId = cookies().get("lastWatchedId")?.value
    const videos = await fetchWatchNextVideos(lastWatchedId)

    return (
        <VideoList
            title="Xem Tiếp"
            subtitle="Theo dõi những tập tiếp theo."
            videos={videos}
        />
    )
}

async function fetchWatchNextVideos(lastWatchedId?: string): Promise<Video[]> {
    const url = getBaseURL("/api/v1/vietnam-history/watch-next")
    if (lastWatchedId) {
        url.searchParams.set("lastWatchedId", lastWatchedId)
    }
    const res = await fetch(url)
    if (!res.ok) {
        return []
    }
    const body = await res.json()
    return body["data"]
}

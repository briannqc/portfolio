import {cookies} from 'next/headers'
import VideoCard from "@/app/vietnam-history/components/video-card";
import {Video} from "@/app/api/v1/vietnam-history/data_store";
import getURL from "@/utils/getURL";

export default async function WatchNext() {
    const lastWatchedId = cookies().get("lastWatchedId")?.value
    const videos = await fetchWatchNextVideos(lastWatchedId)

    return (
        <section className="w-full">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-2xl font-semibold tracking-tight">
                        Xem Tiếp
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Theo dõi những tập tiếp theo.
                    </p>
                </div>
            </div>
            <div className="carousel rounded-box space-x-4 p-4 w-full">
                {videos.map(v => <div key={v.id} className="carousel-item"><VideoCard {...v}/></div>)}
            </div>
        </section>
    )
}

async function fetchWatchNextVideos(lastWatchedId?: string): Promise<Video[]> {
    const url = getURL("/api/v1/vietnam-history/watch-next")
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

import getURL from "@/utils/getURL";
import {Video} from "@/app/api/v1/vietnam-history/models";
import VideoList from "@/app/vietnam-history/components/video-list";
import Link from "next/link";

export default async function VideoLibrary() {
    const videos = await fetchVideoLibrary()
    return (
        <>
            <VideoList
                title="Thư Viện"
                subtitle="Hơn 1,500 tập phim giúp bạn nắm rõ lịch sử Việt Nam."
                videos={videos}
            />
            <Link className="btn btn-outline btn-wide" href="/vietnam-history/video-library">Tất cả videos</Link>
        </>
    )
}

async function fetchVideoLibrary(): Promise<Video[]> {
    const url = getURL("/api/v1/vietnam-history/video-library")
    const res = await fetch(url)
    if (!res.ok) {
        return []
    }
    const body = await res.json()
    return body["data"]
}

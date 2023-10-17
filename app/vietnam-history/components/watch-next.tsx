"use client"

import getURL from "@/utils/getURL";
import VideoList from "@/app/vietnam-history/components/video-list";
import {Video} from "@/app/api/v1/vietnam-history/models";
import {useEffect, useState} from "react";
import {useReadLocalStorage} from "usehooks-ts";

export default function WatchNext() {
    const [loading, setLoading] = useState(false)
    const [videos, setVideos] = useState<Video[]>([])

    const lastWatchedId = useReadLocalStorage<string>("lastWatchedId")

    const loadVideos = () => {
        if (loading) {
            return
        }
        setLoading(true)
        fetchWatchNextVideos(lastWatchedId)
            .then(videos => {
                setVideos(videos)
                setLoading(false)
            })
            .catch(() => {
                setLoading(false)
            })
    }
    useEffect(loadVideos, [lastWatchedId])

    return (
        <VideoList
            title="Xem Tiếp"
            subtitle="Theo dõi những tập tiếp theo."
            videos={videos}
        />
    )
}

async function fetchWatchNextVideos(lastWatchedId: string | null): Promise<Video[]> {
    const url = getURL("/api/v1/vietnam-history/watch-next")
    if (lastWatchedId !== null) {
        url.searchParams.set("lastWatchedId", lastWatchedId)
    }
    const res = await fetch(url)
    if (!res.ok) {
        return []
    }
    const body = await res.json()
    return body["data"]
}

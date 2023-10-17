"use client"

import getURL from "@/utils/getURL";
import VideoList from "@/app/vietnam-history/components/video-list";
import {Video} from "@/app/api/v1/vietnam-history/models";
import {useEffect, useState} from "react";
import {useReadLocalStorage} from "usehooks-ts";

export default function RecentlyWatched() {
    const [loading, setLoading] = useState(false)
    const [videos, setVideos] = useState<Video[]>([])
    const recentlyWatchedVideoIds = useReadLocalStorage<number[]>('recentlyWatchedVideoIds')

    const loadVideos = () => {
        if (!recentlyWatchedVideoIds) {
            return
        }
        if (loading) {
            return
        }
        setLoading(true)
        fetchVideos(recentlyWatchedVideoIds)
            .then(videos => {
                setVideos(videos)
                setLoading(false)
            })
            .catch(() => {
                setLoading(false)
            })
    }
    useEffect(loadVideos, [recentlyWatchedVideoIds])

    return (
        <VideoList
            title="Xem Lại"
            subtitle="Xem lại những videos mới xem gần đây."
            videos={videos}
        />
    )
}

const fetchVideos = async (videoIds: number[]) => {
    const url = getURL("/api/v1/vietnam-history/video-library")
    url.searchParams.set("ids", JSON.stringify(videoIds))
    const res = await fetch(url);
    if (!res.ok) {
        return []
    }
    const body = await res.json();
    return body["data"];
}

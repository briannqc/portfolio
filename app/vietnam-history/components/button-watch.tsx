"use client"

import Link from "next/link";
import {useLocalStorage} from "usehooks-ts";
import {useEffect, useState} from "react";

export default function ButtonWatch({videoId, url}: { videoId: number, url: string }) {
    const [lastWatchedId, setLastWatchedId] = useLocalStorage<number>('lastWatchedId', 0)
    const [recentlyWatchedVideoIds, setRecentlyWatchedVideoIds] = useLocalStorage<number[]>('recentlyWatchedVideoIds', [])
    const [watched, setWatched] = useState(false)

    useEffect(() => setWatched(recentlyWatchedVideoIds.includes(videoId)), [lastWatchedId, recentlyWatchedVideoIds]);

    const handleOnClick = () => {
        setWatched(true)
        setLastWatchedId(videoId)
        setRecentlyWatchedVideoIds(prev => {
            prev.unshift(videoId)
            return Array.from(new Set(prev.slice(0, 10)))
        })
    }

    return (
        <Link
            onClick={handleOnClick}
            className={"btn btn-outline btn-sm " + (watched ? "btn-primary" : "btn-secondary")}
            href={url}
            target="_blank"
        >
            {watched ? "Xem Lại" : "Xem Ngay"}
        </Link>
    )
}
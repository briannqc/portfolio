"use client"

import {useEffect, useState} from "react";
import InfiniteScroll from 'react-infinite-scroll-component';
import {Video} from "@/app/api/v1/vietnam-history/models";
import getURL from "@/utils/getURL";
import VideoCard, {VideoCardSkeleton} from "@/app/vietnam-history/components/video-card";

export default function VideoLibrary() {
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState<Video[]>([])

    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)

    const loadMoreData = () => {
        if (loading) {
            return
        }
        setLoading(true)
        fetchVideos(page)
            .then(videos => {
                setData([...data, ...videos])
                setLoading(false)
                setPage(prevState => prevState + 1)
                setHasMore(videos.length > 0)
            })
            .catch(() => {
                setLoading(false)
            })
    }
    useEffect(() => loadMoreData(), [])

    return (
        <main className="flex flex-col items-start justify-between">
            <section className="w-full">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-semibold tracking-tight">
                            Thư Viện
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Hơn 1,500 tập phim giúp bạn nắm rõ lịch sử Việt Nam.
                        </p>
                    </div>
                </div>
                <InfiniteScroll
                    dataLength={data.length}
                    next={loadMoreData}
                    hasMore={hasMore}
                    loader={<VideoCardSkeleton/>}
                    endMessage={<EndMessage/>}
                    scrollableTarget="scrollableDiv"
                >
                    <div className="py-5 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
                        {data.map(v => <VideoCard key={v.id} {...v}/>)}
                    </div>
                </InfiniteScroll>
            </section>
        </main>
    )
}

const EndMessage = () => {
    return (
        <div className="flex flex-col w-full border-opacity-50 text-center">
            <div className="divider">🎉🥳 Chúc mừng bạn đã nắm vững 80% Lịch sử Việt Nam 🥳🎉</div>
            <p>Chúng tôi sẽ sớm cập những videos mới</p>
        </div>
    )
}

const fetchVideos = async (page: number) => {
    const url = getURL("/api/v1/vietnam-history/video-library")
    url.searchParams.set("page", String(page))
    const res = await fetch(url)
    if (!res.ok) {
        return []
    }
    const body = await res.json()
    return body["data"]
}

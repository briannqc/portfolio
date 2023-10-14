"use client"

import {useEffect, useState} from "react";
import Image from "next/image";
import Link from "next/link";
import InfiniteScroll from 'react-infinite-scroll-component';
import {Skeleton} from "@/components/ui/skeleton"
import {Separator} from "@/components/ui/separator"


type Thumbnail = {
    url: string
    width: number
    height: number
}

type Video = {
    title: string
    url: string
    datetime: string
    thumbnail: Thumbnail
}

const fetchVideos = async (offset: number, limit: number): Promise<Video[]> => {
    const videos: Video[] = require("./videos.json")
    return videos.slice(offset, offset + limit)
}

const VideoViewItem = (video: Video) => {
    return (
        <div className="w-max-[400px]">
            <div className="overflow-hidden rounded-md w-fit h-fit">
                <Link href={video.url}>
                    <Image
                        src={video.thumbnail.url}
                        alt={video.title}
                        width={400}
                        height={250}
                        className="object-cover transition-all hover:scale-105"
                    />
                </Link>
            </div>
            <Link href={video.url}><h4 className="font-semibold">{video.title}</h4></Link>
            <p className="text-sm">{video.datetime}</p>
        </div>
    )
}

const VideoViewSkeleton = () => {
    return (
        <div className="w-max-[400px]">
            <Skeleton className="w-[400px] h-[250px] rounded-full"/>
            <Skeleton className="h-4 w-[400px]"/>
            <Skeleton className="h-4 w-[400px]"/>
        </div>
    )
}

const InfiniteScrollEndMessage = () => {
    return (
        <div className="text-center">
            <Separator className="my-4"/>
            <p>🎉🥳👏Chúc mừng bạn đã nắm vững 80% lịch sử Việt Nam👏🥳🎉</p>
            <p>🤝Chúng tôi sẽ sớm cập những videos mới🤝</p>
        </div>
    )
}

export default function Home() {
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState<Video[]>([])

    const [offset, setOffset] = useState(0)
    const limit = 50
    const [hasMore, setHasMore] = useState(true)

    const loadMoreData = () => {
        if (loading) {
            return
        }
        setLoading(true)
        fetchVideos(offset, limit)
            .then(videos => {
                setData([...data, ...videos])
                setLoading(false)
                setOffset(prevState => prevState + videos.length)
                setHasMore(videos.length > 0)
            })
            .catch(() => {
                setLoading(false)
            })
    }
    useEffect(() => loadMoreData(), [])

    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-12 md:p-24">
            <h1>Lịch sử Việt Nam by VTV</h1>
            <h1>Phim hoat hinh lich su Vietnam</h1>
            <InfiniteScroll
                dataLength={data.length}
                next={loadMoreData}
                hasMore={hasMore}
                loader={<VideoViewSkeleton/>}
                endMessage={<InfiniteScrollEndMessage/>}
                scrollableTarget="scrollableDiv"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {data.map(v => <VideoViewItem key={v.url} {...v} />)}
                </div>
            </InfiniteScroll>
        </main>
    )
}

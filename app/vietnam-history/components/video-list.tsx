import VideoCard from "@/app/vietnam-history/components/video-card"
import {Video} from "@/app/api/v1/vietnam-history/models"

type VideoListProps = {
    title: string
    subtitle: string
    videos: Video[]
}
export default async function VideoList({title, subtitle, videos}: VideoListProps) {
    return (
        <section className="w-full">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
                    <p className="text-sm text-muted-foreground">{subtitle}</p>
                </div>
            </div>
            <div className="carousel rounded-box space-x-4 p-4 w-full">
                {videos.map(v => <div key={v.id} className="carousel-item"><VideoCard {...v}/></div>)}
            </div>
        </section>
    )
}

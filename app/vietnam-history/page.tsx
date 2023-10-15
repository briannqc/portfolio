import WatchNext from "@/app/vietnam-history/components/watch-next";
import VideoLibrary from "@/app/vietnam-history/components/video-library";

export default function VietnamHistory() {
    return (
        <main className="flex flex-col items-start justify-between">
            <WatchNext/>
            <div className="p-3"/>
            <VideoLibrary/>
        </main>
    )
}
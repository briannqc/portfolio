import WatchNext from "@/app/vietnam-history/components/watch-next";
import VideoLibrary from "@/app/vietnam-history/components/video-library";

export default function VietnamHistory() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
            <WatchNext/>
            <div className="divider"></div>
            <VideoLibrary/>
        </main>
    )
}
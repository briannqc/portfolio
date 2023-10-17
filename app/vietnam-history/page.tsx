import WatchNext from "@/app/vietnam-history/components/watch-next";
import VideoLibrary from "@/app/vietnam-history/components/video-library";
import RecentlyWatched from "@/app/vietnam-history/components/recently-watched";

export default async function VietnamHistory() {
    return (
        <main className="flex flex-col items-start justify-between">
            <WatchNext/>
            <RecentlyWatched/>
            <VideoLibrary/>
        </main>
    )
}
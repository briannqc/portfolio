type Thumbnail = {
    url: string
    width: number
    height: number
}

export type Video = {
    id: number
    title: string
    url: string
    datetime: string
    thumbnail: Thumbnail
}

async function readAll(): Promise<Video[]> {
    return require("./data.json")
}

export async function fetchVideoLibrary(page: number): Promise<Video[]> {
    const pageSize = 50
    const videos = await readAll()

    const start = (page - 1) * pageSize
    const end = start + pageSize
    return videos.slice(start, end)
}

export async function fetchWatchNextVideos(lastWatchedVideoId: number): Promise<Video[]> {
    const videos = await readAll()

    const watchNextMaxSize = 5
    let indexOfLastWatchedVideo = indexOfVideo(videos, lastWatchedVideoId)
    if (indexOfLastWatchedVideo < 0) {
        indexOfLastWatchedVideo = watchNextMaxSize - 1
    }

    const watchNextVideos: Video[] = []
    for (let i = 0; i < watchNextMaxSize && indexOfLastWatchedVideo - i >= 0; i++) {
        watchNextVideos.push(videos[indexOfLastWatchedVideo - i])
    }
    return watchNextVideos
}

function indexOfVideo(videos: Video[], videoId: number) {
    let left: number = 0;
    let right: number = videos.length - 1;

    while (left <= right) {
        const mid: number = Math.floor((left + right) / 2);

        if (videos[mid].id === videoId) {
            return mid;
        }
        if (videoId > videos[mid].id) {
            right = mid - 1;
        } else {
            left = mid + 1;
        }
    }
    return -1;
}
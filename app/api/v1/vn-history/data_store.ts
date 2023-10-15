type Thumbnail = {
    url: string
    width: number
    height: number
}

export type Video = {
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
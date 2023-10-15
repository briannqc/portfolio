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

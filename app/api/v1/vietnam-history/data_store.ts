import * as cheerio from 'cheerio';
import type {Element} from "domhandler";
import {Video} from "@/app/api/v1/vietnam-history/models";

async function fetchAllVideos(): Promise<Video[]> {
    const oldVideos: Video[] = require("./data.json")
    let latestVideoId = -1
    if (oldVideos.length > 0) {
        latestVideoId = oldVideos[0].id
    }
    const newVideos = await fetchVideosNewerThan(latestVideoId)
    return [...newVideos, ...oldVideos]
}

async function fetchVideosNewerThan(latestVideoId: number): Promise<Video[]> {
    const newVideos: Video[] = []
    let reachedLatestVideo = false
    let page = 1
    while (!reachedLatestVideo) {
        const videos = await fetchVideosOnPage(page)
        if (videos.length === 0) {
            break
        }

        for (const video of videos) {
            if (video.id == latestVideoId) {
                reachedLatestVideo = true
                break
            }
            newVideos.push(video)
        }
        page++
    }
    return newVideos
}

async function fetchVideosOnPage(page: number): Promise<Video[]> {
    const keyword: string = "khat%20vong%20non%20song"
    const url = `https://vtv.vn/tim-kiem.htm?keywords=${keyword}&type=3&page=${page}`
    const duration24Hours = 24 * 60 * 60
    const response = await fetch(url, {next: {revalidate: duration24Hours}})

    const htmlString = await response.text()
    const $ = cheerio.load(htmlString)
    const liElements = $('#SearchSolr1').find("li")
    if (liElements.length === 0) {
        return []
    }

    const data: Video[] = []
    liElements.each((_, element) => {
        const video = constructVideoFromLiElement($, element)
        data.push(video)
    })

    return data
}

function constructVideoFromLiElement($: cheerio.CheerioAPI, element: Element): Video {
    const aLink = $(element).find("> a")!
    const title = aLink.attr("title")!.replace("Khát vọng non sông: ", "")
    const link = aLink.attr("href")

    const imgThumbnail = aLink.find("> img")
    const thumbnailWidth = 400
    const thumbnailHeight = 250
    const thumbnailUrl = scrapeThumbnailUrl(imgThumbnail, thumbnailWidth, thumbnailHeight)

    const time = $(element).find(".time").text()
    const id = dateTimeToInt(time)

    return {
        id: id,
        title: title,
        url: `https://vtv.vn${link}`,
        datetime: time,
        thumbnail: {
            url: thumbnailUrl,
            width: Number(thumbnailWidth),
            height: Number(thumbnailHeight),
        },
    }
}

function scrapeThumbnailUrl(imgElement: cheerio.Cheerio<Element>, width: number, height: number) {
    const url = imgElement.attr("src")!
    const originalWidth = imgElement.attr("width")
    const originalHeight = imgElement.attr("height")
    const originalSize = `zoom/${originalWidth}_${originalHeight}`

    const expectedSize = `zoom/${width}_${height}`
    return url.replace(originalSize, expectedSize)
}

/**
 * Convert date time string to Integer
 * @param datetime Of format "13/10/2023 22:22"
 * @returns {number} E.g. 202310132222
 */
function dateTimeToInt(datetime: string): number {
    const [datePart, timePart] = datetime.split(' ');
    const [day, month, year] = datePart.split('/').map(Number);
    const [hour, minute] = timePart.split(':').map(Number);

    const yyyy = year
    const MM = month.toString().padStart(2, '0')
    const dd = day.toString().padStart(2, '0')
    const hh = hour.toString().padStart(2, '0')
    const mm = minute.toString().padStart(2, '0')
    return Number(`${yyyy}${MM}${dd}${hh}${mm}`);
}

export type VideoQuery = {
    page?: number
    ids?: number[]
}

export async function fetchVideoLibrary(query: VideoQuery): Promise<Video[]> {
    let videos = await fetchAllVideos()
    if (query.ids) {
        videos = videos.filter(v => query.ids!.includes(v.id))
    }

    if (query.page) {
        const pageSize = 50
        const start = (query.page - 1) * pageSize
        const end = start + pageSize
        videos = videos.slice(start, end)
    }

    return videos
}

export async function fetchWatchNextVideos(lastWatchedVideoId: number): Promise<Video[]> {
    const videos = await fetchAllVideos()

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
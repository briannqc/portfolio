const axios = require('axios')
const cheerio = require('cheerio')
const fs = require('fs');

const ErrorNoMoreData = Error("No more data")

const scrapeWebsite = async (url) => {
    try {
        const response = await axios.get(url)
        const $ = cheerio.load(response.data)
        const results = $('#SearchSolr1').find("li")
        if (results.length === 0) {
            return Promise.reject(ErrorNoMoreData)
        }

        const data = []
        results.each((_, element) => {
            const aLink = $(element).find("> a")
            const title = aLink.attr("title")
                .replace("Khát vọng non sông: ", "")
                .replace("Hào khí ngàn năm: ", "")
            const link = aLink.attr("href")

            const imgThumbnail = aLink.find("> img")
            const thumbnailWidth = 400
            const thumbnailHeight = 250
            const thumbnailUrl = scrapeThumbnail(imgThumbnail, thumbnailWidth, thumbnailHeight)

            const time = $(element).find(".time").text()

            const video = {
                title: title,
                url: `https://vtv.vn${link}`,
                datetime: time,
                thumbnail: {
                    url: thumbnailUrl,
                    width: Number(thumbnailWidth),
                    height: Number(thumbnailHeight),
                },
            }
            data.push(video)
        })
        return Promise.resolve(data)
    } catch (error) {
        return Promise.reject(error)
    }
}

const scrapeThumbnail = (imgElement, width, height) => {
    const url = imgElement.attr("src")
    const originalWidth = imgElement.attr("width")
    const originalHeight = imgElement.attr("height")
    const originalSize = `zoom/${originalWidth}_${originalHeight}`

    const expectedSize = `zoom/${width}_${height}`
    return url.replace(originalSize, expectedSize)
}

const scrapeData = async () => {
    const data = []
    const keywords = ["khat%20vong%20non%20song", "hao%20khi%20ngan%20nam"]
    for (const keyword of keywords) {
        let page = 1
        while (true) {
            try {
                const url = `https://vtv.vn/tim-kiem.htm?keywords=${keyword}&type=3&page=${page}`
                console.log(`Crawling data from: ${url}`)

                const pageData = await scrapeWebsite(url)
                data.push(...pageData)
            } catch (ErrorNoMoreData) {
                console.log(`Reached end of data for keyword: ${keyword}`)
                break;
            }
            page++
        }
    }
    return Promise.resolve(data)
}

scrapeData()
    .then(data => fs.writeFileSync('data.json', JSON.stringify(data, null, 2)))
    .catch(err => console.log("Unexpected error happened while crawling data", err))

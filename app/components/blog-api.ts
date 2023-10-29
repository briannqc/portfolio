const sampleMediumUserInfo = {
    "id": "18307ee2ebb8",
    "username": "briannqc",
    "fullname": "Brian NQC",
    "bio": "Follow me for contents about Golang, Java, Software Architecture and more",
    "followers_count": 380,
    "following_count": 5,
    "image_url": "https://miro.medium.com/1*9uiL79V_6U9yNQw2K_TYkw.png",
    "twitter_username": "",
    "is_writer_program_enrolled": true,
    "allow_notes": true,
    "medium_member_at": "2023-08-11 06:48:13",
    "is_suspended": false,
    "top_writer_in": [],
    "has_list": true,
    "is_book_author": false
}

const sampleMediumArticles = {
    "associated_articles": [
        "1fd94f9fb9a1",
        "3ffe23f11388",
        "622fc04278cb",
        "a72fe533b8f4",
        "b546596c8e6b",
        "c6f88070aafa",
        "205362df9c80",
        "37583980763f",
        "742a49bc8d89",
        "8b42610cad81",
        "c25297226905",
        "362ca0c91b80",
        "2e3c2ef448"
    ]
}

type MediumUserInfo = typeof sampleMediumUserInfo
type MediumArticles = typeof sampleMediumArticles
type MediumStats = {
    followersCount: number
    articlesCount: number
}

export async function fetchMediumStats(): Promise<MediumStats> {
    if (process.env.RAPID_API_USE_MOCK !== "false") {
        return {followersCount: 380, articlesCount: 15}
    }

    const userId = process.env.BRIAN_MEDIUM_USER_ID!
    const [followersCount, articlesCount] = await Promise.all([
        fetchMediumFollowersCount(userId),
        fetchMediumArticlesCount(userId),
    ])
    return {
        followersCount: followersCount,
        articlesCount: articlesCount
    }
}

async function fetchMediumFollowersCount(userId: string): Promise<number> {
    const path = `user/${userId}`
    const response = await fetchMediumApi(path)
    const result: MediumUserInfo = await response.json()
    return result.followers_count
}

async function fetchMediumArticlesCount(userId: string): Promise<number> {
    const path = `user/${userId}/articles`
    const response = await fetchMediumApi(path)
    const result: MediumArticles = await response.json()
    return result.associated_articles.length
}

async function fetchMediumApi(path: string) {
    const hostname = process.env.RAPID_API_HOST!
    const apiKey = process.env.RAPID_API_KEY!
    const duration5Days = 5 * 24 * 60 * 60

    const url = `https://${hostname}/${path}`
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': apiKey,
            'X-RapidAPI-Host': hostname
        },
        next: {
            revalidate: duration5Days
        }
    };
    return fetch(url, options)
}

import {NextRequest, NextResponse} from "next/server";
import {fetchWatchNextVideos} from "@/app/api/v1/vietnam-history/data_store";

export async function GET(request: NextRequest) {
    const lastWatchedId = extractLastWatchedIdQuery(request)
    const videos = await fetchWatchNextVideos(lastWatchedId)
    return NextResponse.json(
        {
            meta: {
                size: videos.length,
            },
            data: videos
        },
        {status: 200}
    )
}

function extractLastWatchedIdQuery(request: NextRequest) {
    const id = request.nextUrl.searchParams.get('lastWatchedId') || "0"
    const idNumber = parseInt(id, 10)
    if (isNaN(idNumber)) {
        return 0
    }
    return idNumber
}
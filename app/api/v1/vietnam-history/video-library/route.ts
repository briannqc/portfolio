import {NextRequest, NextResponse} from "next/server";
import {fetchVideoLibrary} from "@/app/api/v1/vietnam-history/data_store";

export async function GET(request: NextRequest) {
    const page = extractPageQuery(request)
    const videos = await fetchVideoLibrary(page)
    return NextResponse.json(
        {
            meta: {
                page: page,
                size: videos.length,
            },
            data: videos
        },
        {status: 200}
    )
}

function extractPageQuery(request: NextRequest) {
    const page = request.nextUrl.searchParams.get('page') || "1"
    const pageNumber = parseInt(page, 10)
    if (isNaN(pageNumber) || pageNumber < 1) {
        return 1
    }
    return pageNumber
}
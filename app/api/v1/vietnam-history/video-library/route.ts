import {NextRequest, NextResponse} from "next/server";
import {fetchVideoLibrary, VideoQuery} from "@/app/api/v1/vietnam-history/data_store";

export async function GET(request: NextRequest) {
    const query = extractVideoQuery(request)
    const videos = await fetchVideoLibrary(query)
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

function extractVideoQuery(request: NextRequest): VideoQuery {
    return {
        page: extractPageQuery(request),
        ids: extractIdsQuery(request)
    }
}

function extractPageQuery(request: NextRequest): number | undefined {
    const page = request.nextUrl.searchParams.get('page')
    if (!page) {
        return undefined
    }

    const pageNumber = parseInt(page, 10)
    if (isNaN(pageNumber) || pageNumber < 1) {
        return 1
    }
    return pageNumber
}

function extractIdsQuery(request: NextRequest): number[] | undefined {
    const ids = request.nextUrl.searchParams.get('ids')
    if (!ids) {
        return undefined
    }
    return JSON.parse(ids)
}

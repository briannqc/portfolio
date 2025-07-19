import {NextRequest, NextResponse} from "next/server";
import {loadDataStore} from "@/app/api/lotus34/v2/data_store"
import {APIResponse} from "@/app/api/lotus34/v2/response";

export async function GET(
    request: NextRequest,
): Promise<NextResponse<APIResponse>> {
    const {page, limit} = parsePaginationQueryParams(request.url)
    const ds = await loadDataStore()
    const allCommunes = ds.listCommunes()

    const startIndex = page * limit
    const endIndex = page * limit + limit
    const currentPageCommunes = allCommunes.slice(startIndex, endIndex)

    const resp: APIResponse = {
        data: currentPageCommunes,
        meta: {
            message: "List communes successfully",
            page: page,
            total: currentPageCommunes.length,
            previousPage: (page === 0) ? null : page - 1,
            nextPage: (endIndex >= allCommunes.length) ? null : page + 1,
        },
    }
    return NextResponse.json(resp, {status: 200})
}

function parsePaginationQueryParams(url: string) {
    const {page: queryPage, limit: queryLimit} = Object.fromEntries(new URL(url).searchParams)
    let page = parseInt(queryPage)
    if (Number.isNaN(page)) {
        page = 0
    }

    let limit = parseInt(queryLimit)
    if (Number.isNaN(limit)) {
        limit = 200
    } else if (limit > 500) {
        limit = 500
    }
    return {page, limit}
}
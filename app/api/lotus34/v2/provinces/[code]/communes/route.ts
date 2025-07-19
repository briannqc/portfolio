import {NextRequest, NextResponse} from "next/server";
import {loadDataStore} from "@/app/api/lotus34/v2/data_store"
import {APIResponse} from "@/app/api/lotus34/v2/response";

export async function GET(
    _: NextRequest,
    {params}: { params: { code: string; } }
): Promise<NextResponse<APIResponse>> {
    const ds = await loadDataStore()
    const communes = ds.listCommunesByProvinceCode(params.code)
    if (!communes) {
        const resp: APIResponse = {
            data: null,
            meta: {
                message: `Province Code ${params.code} not found`,
            }
        }
        return NextResponse.json(resp, {status: 404})
    }

    const resp: APIResponse = {
        data: communes,
        meta: {
            message: "List communes successfully",
            page: 0,
            total: communes.length,
            previousPage: null,
            nextPage: null,
        }
    }
    return NextResponse.json(resp, {status: 200})
}

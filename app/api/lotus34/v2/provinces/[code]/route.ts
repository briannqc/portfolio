import {NextRequest, NextResponse} from "next/server";
import {loadDataStore} from "@/app/api/lotus34/v2/data_store"
import {APIResponse} from "@/app/api/lotus34/v2/response";

export async function GET(
    _: NextRequest,
    {params}: { params: { code: string; } }
): Promise<NextResponse<APIResponse>> {
    const ds = await loadDataStore()
    const province = ds.findProvinceByCode(params.code)
    if (!province) {
        const resp: APIResponse = {
            data: null,
            meta: {
                message: `Province Code ${params.code} not found`,
            }
        }
        return NextResponse.json(resp, {status: 404})
    }

    const resp: APIResponse = {
        data: province,
        meta: {
            message: "Get province successfully",
        }
    }
    return NextResponse.json(resp, {status: 200})
}

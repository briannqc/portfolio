import {NextRequest, NextResponse} from "next/server";
import {loadDataStore} from "@/app/api/lotus34/v2/data_store"
import {APIResponse} from "@/app/api/lotus34/v2/response";

export async function GET(_: NextRequest): Promise<NextResponse<APIResponse>> {
    const ds = await loadDataStore()
    const provinces = ds.listProvinces()
    const resp: APIResponse = {
        data: provinces,
        meta: {
            message: "List provinces successfully",
            page: 0,
            total: provinces.length,
            previousPage: null,
            nextPage: null,
        }
    }
    return NextResponse.json(resp, {status: 200})
}

import {NextRequest, NextResponse} from "next/server";
import {loadDataStore} from "@/app/api/lotus34/v2/data_store"

export async function GET(
    _: NextRequest,
    {params}: { params: { code: string; } }
) {
    const ds = await loadDataStore()
    const province = ds.findProvinceByCode(params.code)
    if (!province) {
        return NextResponse.json({}, {status: 404})
    }

    return NextResponse.json(
        {
            data: province
        },
        {status: 200}
    )
}

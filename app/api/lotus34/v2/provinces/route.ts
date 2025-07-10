import {NextRequest, NextResponse} from "next/server";
import {loadDataStore} from "@/app/api/lotus34/v2/data_store"

export async function GET(_: NextRequest) {
    const ds = await loadDataStore()
    const provinces = ds.listProvinces()
    return NextResponse.json(
        {
            meta: {
                size: provinces.length,
            },
            data: provinces
        },
        {status: 200}
    )
}

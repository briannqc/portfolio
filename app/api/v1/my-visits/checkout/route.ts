import {NextRequest, NextResponse} from "next/server";
import {Place} from "@/app/api/v1/my-visits/models";
import {checkOut} from "@/app/api/v1/my-visits/data_store";


export async function POST(request: NextRequest) {
    const place: Place = await request.json()
    const successful = await checkOut(place)
    if (successful) {
        return NextResponse.json({success: true});
    } else {
        return NextResponse.json({success: false}, {status: 500});
    }
}

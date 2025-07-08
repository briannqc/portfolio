import {NextRequest, NextResponse} from "next/server";

export async function GET(request: NextRequest) {
    return NextResponse.json(
        {
            meta: {
                size: 34,
            },
            data: [
                {
                    name: "Hà Nội"
                }
            ]
        },
        {status: 200}
    )
}

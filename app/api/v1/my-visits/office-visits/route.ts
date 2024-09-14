import {NextResponse} from "next/server";
import {retrieveOfficeVisits} from "@/app/api/v1/my-visits/data_store";


export async function GET() {
    const visits = await retrieveOfficeVisits()
    return NextResponse.json({data: visits});
}

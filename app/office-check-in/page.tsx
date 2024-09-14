import React from "react";
import {OfficeVisits} from "@/app/api/v1/my-visits/models";
import getURL from "@/utils/getURL";
import {DateTime} from "luxon";

export const dynamic = 'force-dynamic';

export default async function OfficeCheckIn(): Promise<React.JSX.Element> {
    const visits = await fetchOfficeVisits()
    if (visits === undefined) {
        return <Error/>
    }

    let heading: string
    let subheading: string
    if (visits.arrivedAt !== undefined) {
        if (visits.leftAt === undefined) {
            heading = "Yes, I'm working in office"
            subheading = `I arrived at ${visits.arrivedAt.toLocaleString(DateTime.TIME_24_SIMPLE)}.`
        } else {
            heading = "Yes, I went to office today"
            subheading = `But, I already left at ${visits.leftAt.toLocaleString(DateTime.TIME_24_SIMPLE)}.`
        }
    } else {
        heading = "No, I'm not going to office today"
        subheading = "I usually go to office 2 to 3 times a week, but not today."
    }

    return (
        <div>
            <h1 className="text-5xl font-bold">{heading}</h1>
            <p className="mt-6 mb-1">{subheading}</p>
            {visits.visitCountThisQuarter > 0 &&
                <p className="my-1">I went to office {visits.visitCountThisQuarter} days this quarter.</p>}
            {visits.trackingSince &&
                <p className="my-1">I started tracking my office check-in
                    since {visits.trackingSince.toLocaleString(DateTime.DATE_MED)}.</p>}
        </div>
    );
}

function Error(): React.JSX.Element {
    return (
        <div>
            <h1 className="text-5xl font-bold">Something went wrong 😔</h1>
            <p className="mt-6">I work 50% from office and 50% from home.</p>
            <p className="mt-2">I develop this webpage to inform my teammates whether I go to office on certain
                days, and also to count my office check-in each quarter.
            </p>
            <p className="mt-2">Somehow, it&apos;s NOT working 😟</p>
        </div>
    )
}

async function fetchOfficeVisits(): Promise<OfficeVisits | undefined> {
    const url = getURL("/api/v1/my-visits/office-visits")
    const res = await fetch(url)
    console.log("Received status code", res.status, "when calling", url.toString())

    if (!res.ok) {
        return undefined
    }
    const body = await res.json()
    const data: OfficeVisits = body["data"]
    data.arrivedAt = deserializeDataTime(data.arrivedAt)
    data.leftAt = deserializeDataTime(data.leftAt)
    data.trackingSince = deserializeDataTime(data.trackingSince)
    return data
}

function deserializeDataTime(str: any): DateTime | undefined {
    if (str === undefined) {
        return undefined
    }
    return DateTime.fromISO(str)
}



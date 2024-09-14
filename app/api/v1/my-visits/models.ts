import {DateTime} from "luxon";

export type Place = {
    location: string;
    address: string;
}

export type OfficeVisits = {
    arrivedAt?: DateTime
    leftAt?: DateTime
    visitCountThisQuarter: number
    trackingSince?: DateTime
}

import {DateTime} from "luxon";


export type Place = {
    place: string;
    address: string;
}

export type OfficeVisits = {
    arrivedAt?: DateTime
    leftAt?: DateTime
    visitCountThisQuarter: number
    trackingSince?: DateTime
}

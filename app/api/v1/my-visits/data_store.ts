import {sql} from '@/app/api/db';
import {Place} from "@/app/api/v1/my-visits/models";

enum Action {
    ARRIVED = 'ARRIVED',
    LEFT = 'LEFT',
}

export async function checkIn(place: Place): Promise<boolean> {
    return insertVisitEvent(place, Action.ARRIVED)
}

export async function checkOut(place: Place): Promise<boolean> {
    return insertVisitEvent(place, Action.LEFT)
}

async function insertVisitEvent(place: Place, action: Action): Promise<boolean> {
    const {rowCount} = await sql.query(`
        INSERT INTO portfolio.place_visits(location, address, action)
        VALUES ('${place.location}', '${place.address}', '${action}')
    `);
    return rowCount === 1;
}
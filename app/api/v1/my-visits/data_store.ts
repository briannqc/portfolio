import {DateTime} from 'luxon';

import {sql} from '@/app/api/db';
import {OfficeVisits, Place} from "@/app/api/v1/my-visits/models";

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
        INSERT INTO portfolio.place_visits(place, address, action)
        VALUES ('${place.place}', '${place.address}', '${action}')
    `);
    return rowCount === 1;
}

export async function retrieveOfficeVisits(): Promise<OfficeVisits> {
    const [firstArrival, lastDeparture, visitsCount, trackingSince] = await Promise.all([
        retrieveEarliestArrivalToOfficeToday(),
        retrieveLastDepartureFromOfficeToday(),
        countVisitsToOfficeThisQuarter(),
        retrieveFirstEverArrivalToOffice()
    ])

    return {
        arrivedAt: firstArrival,
        leftAt: lastDeparture,
        visitCountThisQuarter: visitsCount,
        trackingSince: trackingSince,
    }
}

async function retrieveEarliestArrivalToOfficeToday(): Promise<DateTime | undefined> {
    const startOfToday = nowInHCMC().startOf('day').toISO()
    const {rowCount, rows} = await sql.query(`
        SELECT at
        FROM portfolio.place_visits
        WHERE place = 'OFFICE' AND action = '${Action.ARRIVED}' AND at > '${startOfToday}'
        ORDER BY at
        LIMIT 1;
    `);

    if (rowCount === 0) {
        return undefined
    }

    const atTz = rows[0].at.toISOString()
    return DateTime.fromISO(atTz)
}

function nowInHCMC(): DateTime {
    return DateTime.now().setZone('Asia/Ho_Chi_Minh')
}

async function retrieveLastDepartureFromOfficeToday(): Promise<DateTime | undefined> {
    const startOfToday = nowInHCMC().startOf('day').toISO()
    const {rowCount, rows} = await sql.query(`
        SELECT at
        FROM portfolio.place_visits
        WHERE place = 'OFFICE' AND action = '${Action.LEFT}' AND at > '${startOfToday}'
        ORDER BY at DESC
        LIMIT 1;
    `);

    if (rowCount === 0) {
        return undefined
    }

    const atTz = rows[0].at.toISOString()
    return DateTime.fromISO(atTz)
}

async function countVisitsToOfficeThisQuarter(): Promise<number> {
    const startOfQuarter = nowInHCMC().startOf('quarter').toISO()
    const {rowCount, rows} = await sql.query(`
        SELECT COUNT(DISTINCT DATE_TRUNC('day', at)) AS visit_days
        FROM portfolio.place_visits
        WHERE place = 'OFFICE' AND action = '${Action.ARRIVED}' AND at > '${startOfQuarter}'
        GROUP BY place;
    `);

    if (rowCount === 0) {
        return 0
    }
    return parseInt(rows[0].visit_days, 10)
}

async function retrieveFirstEverArrivalToOffice(): Promise<DateTime | undefined> {
    const {rowCount, rows} = await sql.query(`
        SELECT at
        FROM portfolio.place_visits
        WHERE place = 'OFFICE' AND action = '${Action.ARRIVED}'
        ORDER BY at
        LIMIT 1;
    `);

    if (rowCount === 0) {
        return undefined
    }

    const atTz = rows[0].at.toISOString()
    return DateTime.fromISO(atTz)
}
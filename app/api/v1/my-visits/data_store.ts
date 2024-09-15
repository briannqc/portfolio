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
    const [{arrivedAt, leftAt}, visitsCount, trackingSince] = await Promise.all([
        retrieveOfficeVisitsToday(),
        countVisitsToOfficeThisQuarter(),
        retrieveFirstEverArrivalToOffice()
    ])

    return {
        arrivedAt: arrivedAt,
        leftAt: leftAt,
        visitCountThisQuarter: visitsCount,
        trackingSince: trackingSince,
    }
}

async function retrieveOfficeVisitsToday(): Promise<{ arrivedAt?: DateTime, leftAt?: DateTime }> {
    const startOfToday = nowInHCMC().startOf('day')
    const {rowCount, rows} = await sql.query(`
        SELECT place, action, at
        FROM portfolio.place_visits
        WHERE place = 'OFFICE'
          AND at > '${startOfToday.toISO()}'
        ORDER BY at;
    `);

    if (rowCount === null || rowCount === 0) {
        return {arrivedAt: undefined, leftAt: undefined}
    }

    const firstArrivalTz = rows.find(r => r.action === Action.ARRIVED)?.at
    if (firstArrivalTz === undefined) {
        console.log("Bad date on, there are records", rowCount, "but no ARRIVED events on", startOfToday)
        return {arrivedAt: undefined, leftAt: undefined}
    }

    const firstArrival = DateTime.fromISO(firstArrivalTz.toISOString())

    const lastRowToday = rows[rowCount - 1]
    let lastDeparture: DateTime | undefined
    if (lastRowToday.action === Action.LEFT) {
        lastDeparture = DateTime.fromISO(lastRowToday.at.toISOString())
    } else {
        lastDeparture = undefined
    }

    return {arrivedAt: firstArrival, leftAt: lastDeparture}
}

function nowInHCMC(): DateTime {
    return DateTime.now().setZone('Asia/Ho_Chi_Minh')
}

async function countVisitsToOfficeThisQuarter(): Promise<number> {
    const startOfQuarter = nowInHCMC().startOf('quarter').toISO()
    const {rowCount, rows} = await sql.query(`
        SELECT COUNT(DISTINCT DATE_TRUNC('day', at)) AS visit_days
        FROM portfolio.place_visits
        WHERE place = 'OFFICE'
          AND action = '${Action.ARRIVED}'
          AND at > '${startOfQuarter}'
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
        WHERE place = 'OFFICE'
          AND action = '${Action.ARRIVED}'
        ORDER BY at
        LIMIT 1;
    `);

    if (rowCount === 0) {
        return undefined
    }

    const atTz = rows[0].at.toISOString()
    return DateTime.fromISO(atTz)
}
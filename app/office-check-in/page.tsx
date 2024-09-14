import {sql} from "@/app/api/db";
import React from "react";

export const dynamic = 'force-dynamic';

export default async function Cart(): Promise<React.JSX.Element> {
    const {rows} = await sql.query(`SELECT * FROM portfolio.location_visits;`);

    return (
        <div>
            {rows.map((row) => (
                <div key={row.timestamp.toString()}>
                    {row.timestamp.toString()} - {row.visit_type} - {row.location}
                </div>
            ))}
        </div>
    );
}
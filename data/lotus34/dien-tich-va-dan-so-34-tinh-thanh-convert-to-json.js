import Papa from 'papaparse';
import path from "path";
import fs from "fs";
import {writeFile} from 'fs/promises';

function normalizeString(str) {
    return str.trim().split(/\s+/).join(' ');
}

async function loadAreasAndPopulationsFromCsv() {
    // Source: https://laodong.vn/thoi-su/ten-34-tinh-thanh-cua-viet-nam-tu-1262025-1522395.ldo
    const filePath = path.resolve('./dien-tich-va-dan-so-34-tinh-thanh.csv');
    const csvFile = fs.readFileSync(filePath, "utf8");
    const csvData = Papa.parse(csvFile, {header: true, dynamicTyping: true})

    const provinces = []
    csvData.data.forEach(row => {
        const {
            "Tên tỉnh": provinceName,
            "Các tỉnh hợp thành": mergedFrom,
            "Dân số (người)": population,
            "Diện tích (km2)": areaInKm2
        } = row;
        provinces.push({
            provinceName: normalizeString(provinceName),
            areaInKm2: areaInKm2,
            population: population,
            mergedFrom: mergedFrom.split(",").map(p => normalizeString(p))
        })
    })

    provinces.sort((p1, p2) => p1.provinceName.localeCompare(p2.provinceName))
    return provinces;
}


async function run() {
    const provinces = await loadAreasAndPopulationsFromCsv()
    const jsonFilePath = path.resolve('./dien-tich-va-dan-so-34-tinh-thanh.json');
    const json = JSON.stringify(provinces, null, 2);
    await writeFile(jsonFilePath, json, 'utf8');
}

await run()
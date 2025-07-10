import ExcelJS from 'exceljs';
import path from "path";
import {writeFile} from 'fs/promises';

function normalizeString(str) {
    return str.trim().split(/\s+/).join(' ');
}

async function loadAreasAndPopulationsFromXlsx() {
    const workbook = new ExcelJS.Workbook();
    const filePath = path.resolve('./dien-tich-va-dan-so-34-tinh-thanh.xlsx');
    await workbook.xlsx.readFile(filePath)
    const sheet = workbook.worksheets[0]

    const seenIndexes = {}
    const provinces = []
    sheet.eachRow({includeEmpty: false}, (row, rowNumber) => {
        if (rowNumber <= 2) {
            // skip 2 header lines
            return;
        }
        const [index, provinceName, areaInKm2, population, administrativeCenter] = row.values.slice(1)
        if (seenIndexes[index] === true) {
            // skip duplicated rows, e.g., the second row below:
            // [28, 'Đồng Nai', 12737.2, 4427700, 'TP. Biên Hòa']
            // [28, '(Bình Phước + Đồng Nai)', 12737.2, 4427700, 'TP. Biên Hòa']
            return;
        }

        seenIndexes[index] = true
        provinces.push({
            provinceName: normalizeString(provinceName),
            areaInKm2: areaInKm2,
            population: population,
            administrativeCenter: administrativeCenter
        })
    });


    provinces.sort((p1, p2) => p1.provinceName.localeCompare(p2.provinceName))
    return provinces;
}


async function run() {
    const provinces = await loadAreasAndPopulationsFromXlsx()
    const jsonFilePath = path.resolve('./dien-tich-va-dan-so-34-tinh-thanh.json');
    const json = JSON.stringify(provinces, null, 2);
    await writeFile(jsonFilePath, json, 'utf8');
}

await run()
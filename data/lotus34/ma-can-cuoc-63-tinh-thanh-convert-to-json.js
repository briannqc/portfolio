import ExcelJS from 'exceljs';
import path from "path";
import {writeFile} from 'fs/promises';

function normalizeString(str) {
    return str.trim().split(/\s+/).join(' ');
}

async function loadIdCardPrefixesFromXlsx() {
    const workbook = new ExcelJS.Workbook();
    const filePath = path.resolve('./ma-can-cuoc-63-tinh-thanh.xlsx');
    await workbook.xlsx.readFile(filePath)
    const sheet = workbook.worksheets[0]

    const idCardPrefixes = []
    sheet.eachRow({includeEmpty: false}, (row, rowNumber) => {
        if (rowNumber === 1) {
            // skip header
            return;
        }
        const [_, provinceName, idCardPrefix] = row.values.slice(1)
        idCardPrefixes.push({
            provinceName: normalizeString(provinceName),
            idCardPrefix: String(idCardPrefix).padStart(3, '0'),
        })
    });


    idCardPrefixes.sort((p1, p2) => p1.provinceName.localeCompare(p2.provinceName))
    return idCardPrefixes;
}

async function run() {
    const telephoneCodes = await loadIdCardPrefixesFromXlsx()
    const jsonFilePath = path.resolve('./ma-can-cuoc-63-tinh-thanh.json');
    const json = JSON.stringify(telephoneCodes, null, 2);
    await writeFile(jsonFilePath, json, 'utf8');
}

await run()
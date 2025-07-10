import ExcelJS from 'exceljs';
import path from "path";
import {writeFile} from 'fs/promises';

function normalizeString(str) {
    return str.trim().split(/\s+/).join(' ');
}

async function loadTelephoneCodesFromXlsx() {
    const workbook = new ExcelJS.Workbook();
    const filePath = path.resolve('./ma-vung-dien-thoai-34-tinh-thanh.xlsx');
    await workbook.xlsx.readFile(filePath)
    const sheet = workbook.worksheets[0]

    const telephoneCodes = []
    sheet.eachRow({includeEmpty: false}, (row, rowNumber) => {
        if (rowNumber === 1) {
            // skip header
            return;
        }
        const [provinceName, telephoneCode] = row.values.slice(1)
        telephoneCodes.push({
            provinceName: normalizeString(provinceName),
            telephoneCode: telephoneCode,
        })
    });


    telephoneCodes.sort((p1, p2) => p1.provinceName.localeCompare(p2.provinceName))
    return telephoneCodes;
}

async function run() {
    const telephoneCodes = await loadTelephoneCodesFromXlsx()
    const jsonFilePath = path.resolve('./ma-vung-dien-thoai-34-tinh-thanh.json');
    const json = JSON.stringify(telephoneCodes, null, 2);
    await writeFile(jsonFilePath, json, 'utf8');
}

await run()
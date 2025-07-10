import ExcelJS from 'exceljs';
import path from "path";
import {writeFile} from 'fs/promises';

function normalizeString(str) {
    return str.trim().split(/\s+/).join(' ');
}

async function loadTelephoneCodesFromXlsx() {
    const workbook = new ExcelJS.Workbook();
    const filePath = path.resolve('./bien-so-xe-34-tinh-thanh.xlsx');
    await workbook.xlsx.readFile(filePath)
    const sheet = workbook.worksheets[0]

    const vehiclePlateCodes = []
    sheet.eachRow({includeEmpty: false}, (row, rowNumber) => {
        if (rowNumber === 1) {
            // skip header
            return;
        }
        const [_, provinceName, rawPlateCodes] = row.values.slice(1)
        vehiclePlateCodes.push({
            provinceName: normalizeString(provinceName),
            plateCodes: parseRawPlateCodes(rawPlateCodes),
        })
    });


    vehiclePlateCodes.sort((p1, p2) => p1.provinceName.localeCompare(p2.provinceName))
    return vehiclePlateCodes;
}

/**
 * parseRawPlateCodes parses the plate codes from xlsx file to an array of plate codes.
 *
 * In the xlsx file, data type of the rawPlateCodes is not consistent. For example,
 * '20' is sometimes a number 20, but can also be a string "20"
 * '20,97' is sometimes a number 20.97, but can also be string "20,97".
 * This function handles all possible types and convert them to array of numbers. E.g.,
 * '20' -> [20], and '20,97' -> [20, 97].
 */
function parseRawPlateCodes(rawPlateCodes) {
    const strPlateCodes = rawPlateCodes.toString()
    let splitPlateCodes
    if (strPlateCodes.includes(".")) {
        splitPlateCodes = strPlateCodes.split(".")
    } else if (strPlateCodes.includes(",")) {
        splitPlateCodes = strPlateCodes.split(",")
    } else {
        splitPlateCodes = [strPlateCodes]
    }

    return splitPlateCodes.map(c => parseInt(c)).sort()
}

async function run() {
    const telephoneCodes = await loadTelephoneCodesFromXlsx()
    const jsonFilePath = path.resolve('./bien-so-xe-34-tinh-thanh.json');
    const json = JSON.stringify(telephoneCodes, null, 2);
    await writeFile(jsonFilePath, json, 'utf8');
}

await run()
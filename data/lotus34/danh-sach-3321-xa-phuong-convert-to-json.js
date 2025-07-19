import ExcelJS from 'exceljs';
import path from "path";
import {writeFile} from 'fs/promises';

function normalizeString(str) {
    return str.trim().split(/\s+/).join(' ');
}

async function loadCommunesFromXlsx() {
    const workbook = new ExcelJS.Workbook();
    const filePath = path.resolve('./danh-sach-3321-xa-phuong.xlsx');
    await workbook.xlsx.readFile(filePath)
    const sheet = workbook.worksheets[0]

    const communes = []
    sheet.eachRow({includeEmpty: false}, (row, rowNumber) => {
        if (rowNumber === 1) {
            // skip header
            return;
        }
        const [code, name, type, resolutionNumber, provinceCode, provinceFullName] = row.values.slice(1)
        communes.push({
            code: normalizeString(code),
            name: splitCommuneName(normalizeString(name)),
            type: normalizeString(type),
            resolutionNumber: normalizeString(resolutionNumber),
            provinceCode: normalizeString(provinceCode),
            provinceFullName: normalizeString(provinceFullName),
        })
    });
    return communes;
}

/**
 * splitCommuneName splits commune name from its full name with type.
 *
 * Examples:
 *   - "Xã Chương Dương" => "Chương Dương"
 *   - "Phường Ba Đình" => "Ba Đình"
 *   - "Đặc khu Vân Đồn" => "Vân Đồn"
 */
function splitCommuneName(communeFullName) {
    const words = communeFullName.split(/\s+/)
    if (words[0].toLowerCase() === 'xã') {
        return words.slice(1).join(" ")
    }
    if (words[0].toLowerCase() === 'phường') {
        return words.slice(1).join(" ")
    }
    return words.slice(2).join(" ")
}

function transformCommunesToProvinces(communes) {
    const provincesObj = {}
    communes.forEach(c => {
        if (provincesObj[c.provinceCode] === undefined) {
            const [provinceType, provinceName] = splitProvinceTypeAndName(c.provinceFullName)
            provincesObj[c.provinceCode] = {
                code: normalizeString(c.provinceCode),
                name: provinceName,
                type: provinceType,
                communes: []
            }
        }
        const commune = {
            code: c.code,
            name: c.name,
            type: c.type,
            resolutionNumber: c.resolutionNumber,
        }
        provincesObj[c.provinceCode].communes.push(commune)
    })

    const provinces = Object.values(provincesObj)
    provinces.forEach(province => {
        province.communes.sort((c1, c2) => c1.code.localeCompare(c2.code))
    })
    provinces.sort((p1, p2) => p1.code.localeCompare(p2.code))

    return provinces
}

/**
 * splitProvinceTypeAndName splits province name from its full name with type.
 *
 * Examples:
 *   - "Tỉnh Quảng Ninh" => ["Tỉnh", "Quảng Ninh"]
 *   - "Thành phố Hồ Chí Minh" => ["Thành phố", "Hồ Chí Minh"]
 */
function splitProvinceTypeAndName(provinceFullName) {
    const words = provinceFullName.split(/\s+/)
    if (words[0].toLowerCase() === 'tỉnh') {
        return ["Tỉnh", words.slice(1).join(" ")]
    }
    return ["Thành phố", words.slice(2).join(" ")]
}

async function run() {
    const communes = await loadCommunesFromXlsx()
    const provinces = transformCommunesToProvinces(communes)

    const jsonFilePath = path.resolve('./danh-sach-3321-xa-phuong.json');
    const json = JSON.stringify(provinces, null, 2);
    await writeFile(jsonFilePath, json, 'utf8');
}

await run()
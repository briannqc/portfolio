import {readFile, writeFile} from 'fs/promises';
import path from 'path';

async function loadAndMergeProvincesData() {
    const [
        provinces,
        areasAndPopulations,
        vehiclePlateCodes,
        telephoneCodes
    ] = await Promise.all([
        loadJSONFromFile('danh-sach-3321-xa-phuong.json'),
        loadJSONFromFile('./dien-tich-va-dan-so-34-tinh-thanh.json'),
        loadJSONFromFile('./bien-so-xe-34-tinh-thanh.json'),
        loadJSONFromFile('./ma-vung-dien-thoai-34-tinh-thanh.json')
    ])

    provinces.forEach(province => {
        const areaAndPopulation = areasAndPopulations.find(e => isSameVietnameseName(e.provinceName, province.name))
        province.areaInKm2 = areaAndPopulation.areaInKm2
        province.population = areaAndPopulation.population

        const vehiclePlate = vehiclePlateCodes.find(e => isSameVietnameseName(e.provinceName, province.name))
        province.vehiclePlateCodes = vehiclePlate.plateCodes

        const telephoneCode = telephoneCodes.find(e => isSameVietnameseName(e.provinceName, province.name))
        province.telephoneCode = telephoneCode.telephoneCode
    })
    return provinces
}

// isSameVietnameseName returns true if the 2 Vietnamese names are equivalent.
//
// In Vietnamese, same words can be written differently yet are same, e.g.,
// "Khánh Hoà" and "Khánh Hòa". This function converts names to all ASCII
// characters then compare.
function isSameVietnameseName(name1, name2) {
    const asciiName1 = name1.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    const asciiName2 = name2.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    return asciiName1 === asciiName2
}

async function loadJSONFromFile(filename) {
    const filePath = path.resolve(filename)
    const buf = await readFile(filePath, 'utf8')
    return JSON.parse(buf.toString());
}

async function run() {
    const provinces = await loadAndMergeProvincesData()
    const jsonFilePath = path.resolve('./provinces.json');
    const json = JSON.stringify(provinces, null, 2);
    await writeFile(jsonFilePath, json, 'utf8');
}

await run()
import path from 'path';
import fs from 'fs/promises';

type Record = {
    code: string
    name: string
    type: string
    idCardPrefix: string
    areaInKm2: number
    population: number
    vehiclePlateCodes: number[]
    telephoneCode: number
    communes: {
        code: string
        name: string
        type: string
    }[]
}

type Province = {
    code: string
    name: string
    type: string
    fullName: string
    idCardPrefix: string
    areaInKm2: number
    population: number
    vehiclePlateCodes: number[]
    telephoneCode: number
}

function newProvince(record: any): Province {
    return {
        code: record.code,
        name: record.name,
        type: record.type,
        fullName: `${record.type} ${record.name}`,
        idCardPrefix: record.idCardPrefix,
        areaInKm2: record.areaInKm2,
        population: record.population,
        vehiclePlateCodes: record.vehiclePlateCodes,
        telephoneCode: record.telephoneCode,
    }
}

type Commune = {
    code: string
    name: string
    type: string
    fullName: string
}

function newCommune(c: any): Commune {
    return {
        code: c.code,
        name: c.name,
        type: c.type,
        fullName: `${c.type} ${c.name}`
    }
}

function isNameEqual(name1: string, name2: string): boolean {
    const lowerCaseName1 = name1.toLowerCase()
    const lowerCaseName2 = name2.toLowerCase()
    if (lowerCaseName1 === lowerCaseName2) {
        return true
    }
    const asciiName1 = lowerCaseName1.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    const asciiName2 = lowerCaseName2.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    return asciiName1 === asciiName2
}

export async function loadDataStore(): Promise<ProvinceDataStore> {
    const filePath = path.join(process.cwd(), "data", "lotus34", "provinces.json")
    const buf = await fs.readFile(filePath)
    const data = JSON.parse(buf.toString())
    return new ProvinceDataStore(data)
}

export class ProvinceDataStore {
    constructor(
        private readonly data: Record[],
    ) {
    }

    listProvinces(): Province[] {
        return this.data.map(record => newProvince(record))
    }

    findProvinceByCode(code: string): Province | undefined {
        const record = this.data.find(p => p.code === code)
        if (record === undefined) {
            return undefined
        }
        return newProvince(record)
    }

    findProvinceByNames(name: string): Province | undefined {
        const record = this.data.find(p => isNameEqual(p.name, name))
        if (record === undefined) {
            return undefined
        }
        return newProvince(record)
    }

    listCommunesByProvinceCode(code: string): Commune[] | undefined {
        const record = this.data.find(p => p.code === code)
        if (record === undefined) {
            return undefined
        }
        return record.communes.map(c => newCommune(c))
    }

    listCommunesByProvinceName(name: string): Commune[] | undefined {
        const record = this.data.find(p => isNameEqual(p.name, name))
        if (record === undefined) {
            return undefined
        }
        return record.communes.map(c => newCommune(c))
    }
}
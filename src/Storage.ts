const homedir = require('os').homedir()
const path = require('path')
import * as fs from 'fs'
const exceljs = require('exceljs')
const https = require('https')
const request = require('request')
const CryptoJS = require("crypto-js")



export class Storage {
    private directory: string = homedir+path.sep+".khmovers"
    private dataDirectory: string = homedir+path.sep+".khmovers"+path.sep+"data"
    private storePath: string = homedir+path.sep+".khmovers"+path.sep+"data"+path.sep+"data.json"

    constructor(ipc) {
        if (!fs.existsSync(this.directory)){
            fs.mkdirSync(this.directory);
        }
        if (!fs.existsSync(this.dataDirectory)){
            fs.mkdirSync(this.dataDirectory);
        }
        try {
            fs.readFileSync(this.storePath)
        } catch (error) {
            fs.writeFileSync(this.storePath, '[]')
        }
        ipc.on('get-movers', (event, arg) => {  event.returnValue = this.getMovers() })
        this.addSheetData()
    }

	addMover(name, address, truck: boolean, latitude, longitude) {
        let movers = this.getMovers()
        var hash = CryptoJS.SHA256(name+address).toString()

        movers.push({
            name: name,
            address: address,
            truck: truck,
            latitude: latitude,
            longitude: longitude,
            hash: hash
        })
        this.setMovers(movers)
	}

	getMovers() : Array<any> {
        return JSON.parse(fs.readFileSync(this.storePath).toString())
	}

    setMovers(movers) {
        fs.writeFileSync(this.storePath, JSON.stringify(movers))
    }
    findMover(hash) {
        let movers = this.getMovers()
        return movers.filter(mover => mover.hash == hash)[0]
    }
    addSheetData() {
        var workbook = new exceljs.Workbook()
        let bannerCount = 0
        let count = 0;
        workbook.xlsx.readFile(homedir+"\\Documents\\DRIVER INFOMATION SHEET (1).xlsx").then(workbook => {
            workbook.getWorksheet(1).eachRow({}, (row, rowNumber) => {
                let withTruck = true
                count++
                if(rowNumber == 1) {
                    return
                }
                if(row.getCell(1).value.startsWith("DRIVER")) {
                    bannerCount++
                    return
                }
                if(bannerCount > 1) {
                    withTruck = false
                }
                if(!row.getCell(4).value) {
                    return
                }
                let name = row.getCell(2).value+" "+row.getCell(1).value
                let address = row.getCell(4).value+" "+row.getCell(5).value+", "+row.getCell(6)+" "+row.getCell(7)
                let hash = CryptoJS.SHA256(name+address).toString()
                if(this.findMover(hash)) {
                    return
                }
                this.search(address, count>10? 1000: 0).then( (data: any) => {
                    console.log()
                    this.addMover(name, address, withTruck, data.latitude, data.longitude)
                })
                
                
            })
        });
    }
    async search(address, delay) {
        return new Promise((resolve, reject) => {
            let options = {
                uri: "https://api.radar.io/v1/search/autocomplete?query="+encodeURIComponent(address),
                method: 'GET',
                headers: {
                'Authorization': 'prj_live_pk_97c9f560f22df75c0c52fe138b9cb0114deb8f70'
                }
            };
//            const options = {
//  hostname: 'example.com',
//  port: 443,
//  path: '/todos',
//  method: 'GET'
//}
            setTimeout(() => {
                request(options, (error, response, body) => {
                    if(error) {
                        reject(error)
                    }
                    if (response.statusCode != 200) {
                        reject('Invalid status code <' + response.statusCode + '>'); 
                    }
                    resolve(JSON.parse(body).addresses[0]);
                });
            }, delay)
        });
    }
}
const homedir = require('os').homedir()
const path = require('path')
import * as fs from 'fs'
const exceljs = require('exceljs')
const https = require('https')
const request = require('request')
const CryptoJS = require("crypto-js")
const settings = require('electron-settings');
const ipc = require('electron').ipcMain

export class Storage {
    private sendEvent;

    constructor(sendEvent) {
        this.sendEvent = sendEvent;
        if(!settings.hasSync('movers')) {
            settings.setSync('movers', [])
        }
        if(settings.hasSync('sheetPath')) {
            ipc.on('get-movers', (event, arg) => {  event.returnValue = this.getMovers() })
            this.addSheetData()
        }
    }

	addMover(name, address, truck: boolean, phone, latitude, longitude) {
        let movers = this.getMovers()
        var hash = CryptoJS.SHA256(name+address).toString()

        movers.push({
            name: name,
            address: address,
            truck: truck,
            phone: phone,
            latitude: latitude,
            longitude: longitude,
            hash: hash
        })
        this.setMovers(movers)
	}

	getMovers() : Array<any> {
        return settings.getSync('movers')
	}

    setMovers(movers) {
        settings.setSync('movers', movers)
    }
    findMover(hash) {
        let movers = this.getMovers()
        return movers.filter(mover => mover.hash == hash)[0]
    }
    setSheetPath(path) {
        console.log(settings.setSync('sheetPath', {path: path}))
        settings.setSync('movers', [])
        this.addSheetData()
    }
    getSheetPath(): string {
        return settings.getSync('sheetPath').path
    }
    addSheetData() {
        var workbook = new exceljs.Workbook()
        let bannerCount = 0
        let count = 0;
        let cell = {
            "firstName": 2,
            "lastName": 1,
            "phone": 5,
            "address": 6,
            "city": 7,
            "state": 8,
            "zip": 9,
            "driver": 4,
            "available": 3,
        }
        workbook.xlsx.readFile(this.getSheetPath()).then(workbook => {
            workbook.getWorksheet(1).eachRow({}, (row, rowNumber) => {
                count++
                if(rowNumber == 1) {
                    return
                }
                if(!row.getCell(cell.address).value) {
                    return
                }
                if(!row.getCell(cell.available).value || row.getCell(cell.available).value != "Y") {
                    return
                }
                let withTruck = (row.getCell(cell.driver) == "DWE")? true: false; 
                let name = row.getCell(cell.firstName).value+" "+row.getCell(cell.lastName).value
                let address = row.getCell(cell.address).value+" "+row.getCell(cell.city).value+", "+row.getCell(cell.state)+" "+row.getCell(cell.zip)
                let phone =  row.getCell(cell.phone).value
                let hash = CryptoJS.SHA256(name+address).toString()
                if(this.findMover(hash)) {
                    return
                }
                this.search(address, count>10? 1000: 0).then( (data: any) => {
                    console.log(data)
                    this.addMover(name, address, withTruck, phone, data.latitude, data.longitude)
                    this.sendEvent('add-movers')
                }).catch(err => {
                    console.log(err)
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
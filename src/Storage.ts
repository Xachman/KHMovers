const homedir = require('os').homedir();
const path = require('path');
import * as fs from 'fs'
const exceljs = require('exceljs');


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
        ipc.on('add-mover', (event, arg) => {  this.addMover(arg.name, arg.address, arg.truck) })
        this.setMovers([])
        this.addSheetData()
    }

	addMover(name, address, truck: boolean) {
        let movers = this.getMovers()
        movers.push({
            name: name,
            address: address,
            truck: truck
        })
        this.setMovers(movers)
	}

	getMovers() : Array<any> {
        return JSON.parse(fs.readFileSync(this.storePath).toString())
	}

    setMovers(movers) {
        fs.writeFileSync(this.storePath, JSON.stringify(movers))
    }

    addSheetData() {
        var workbook = new exceljs.Workbook()
        let bannerCount = 0
        let withTruck = true
        let data = workbook.xlsx.readFile("C:\\Users\\ziron\\Documents\\DRIVER INFOMATION SHEET (1).xlsx").then(workbook => {
            workbook.getWorksheet(1).eachRow({}, (row, rowNumber) => {
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
                
                this.addMover(name, address, withTruck)
                
            })
        });
    }
}
const homedir = require('os').homedir();
const path = require('path');
import * as fs from 'fs'


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
        ipc.on('add-mover', (event, arg) => {  this.addMover(arg.name, arg.address) })
    }

	addMover(name, address) {
        let movers = this.getMovers()
        movers.push({
            name: name,
            address: address
        })
        this.setMovers(movers)
	}

	getMovers() : Array<any> {
        return JSON.parse(fs.readFileSync(this.storePath).toString())
	}

    setMovers(movers) {
        fs.writeFileSync(this.storePath, JSON.stringify(movers))
    }
}
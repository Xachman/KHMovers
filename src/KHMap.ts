const leaflet = require('leaflet');
var ipcRenderer = require('electron').ipcRenderer;

export class KHMap {
    private map;
    display() {
        this.map = leaflet.map('map', {
            center: [40.348, -79.055],
            zoom: 5
        });
        leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        }).addTo(this.map);

        globalThis.khMap = this


    }

    setMarkers() {

    }

    getMap() {
        return this.map
    }

    getMovers() {
        return ipcRenderer.sendSync('get-movers')
    }

    addMover(name, address) {
        ipcRenderer.sendSync('add-mover', {
            name: name,
            address: address
        })
    }
    addMarkers() {
        this.getMovers().forEach(mover => {
            leaflet.marker([mover.latitude, mover.longitude]).addTo(this.map)
            .bindPopup(mover.name+'<br>'+mover.address)
        });
    }
}


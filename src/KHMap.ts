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
        this.addMarkers()


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
        var greenIcon = new leaflet.Icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });
        var yellowIcon = new leaflet.Icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });
        this.getMovers().forEach(mover => {
            leaflet.marker([mover.latitude, mover.longitude], {icon: mover.truck? greenIcon: yellowIcon}).addTo(this.map)
            .bindPopup(mover.name+'<br>'+mover.address)
        });
    }
}


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
        //leaflet.marker([51.5, -0.09]).addTo(this.map)
        //.bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
        //.openPopup();

        globalThis.khMap = this
        this.getData()
    }

    getMap() {
        return this.map
    }

    getData() {
        let data = ipcRenderer.sendSync('get-movers')
        console.log(data)
    }
}


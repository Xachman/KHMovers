const leaflet = require('leaflet');
var ipcRenderer = require('electron').ipcRenderer;
let request = require('request')
let geodist = require('geodist')

export class KHMap {
    private map;
    private searchMarker;
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
        this.setSearchButton()
        ipcRenderer.on('add-markers', () => {
            this.addMarkers()
        })
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

    setSearchButton() {
        var blueIcon = new leaflet.Icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });
        document.querySelector('#searchButton').addEventListener('click', (event) => {
            event.preventDefault();
            let text = (document.querySelector('#searchInput')  as HTMLInputElement).value
            console.log(text)
            let options = {
                uri: "https://api.radar.io/v1/search/autocomplete?query="+encodeURIComponent(text),
                method: 'GET',
                headers: {
                'Authorization': 'prj_live_pk_97c9f560f22df75c0c52fe138b9cb0114deb8f70'
                }
            };
            request(options, (error, response, body) => {
                if(error) {
                    console.log(error)
                    return
                }
                if (response.statusCode != 200) {
                    console.log('Invalid status code <' + response.statusCode + '>'); 
                    return
                }
                let json = JSON.parse(body)
                let latitude = json.addresses[0].latitude
                let longitude = json.addresses[0].longitude
                if(this.searchMarker) {
                    this.getMap().removeLayer(this.searchMarker)
                }
                this.searchMarker = leaflet.marker([latitude, longitude], blueIcon).addTo(this.map)
                this.listByDistance(latitude, longitude)
            });
        })

    }

    listByDistance(lat, lon) {
        let moversList = this.getMovers()
        moversList.forEach( item => {
            item.distance = geodist({lat: lat, lon: lon}, {lat: item.latitude, long: item.longitude})
        }) 
        moversList.sort((first, second) => {

            return first.distance - second.distance
        })

        console.log(moversList)
        this.displayMovers(moversList)

    }

    displayMovers(movers) {
        let el = document.querySelector("#searchOutput")
        let html = ""
        movers.forEach(element => {
            console.log(element)
            html+="<div class=\"mover-box "+(element.truck? "truck": "")+"\">"
            html+="<strong>"+element.name+"</strong>"
            html+="<div>"+element.address+"</div>"
            html+="<div>"+element.distance+" Miles</div>"
            html+="</div>"
            
        });
        console.log(html)
        el.innerHTML = html
    }
}


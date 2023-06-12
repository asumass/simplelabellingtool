import RasterService from "./services/RasterService.js"
import PubSub from 'pubsub-js'
const _ = require('lodash');
import 'leaflet-draw';

import FileSaver from 'file-saver';



class Map{
constructor(container){
    this.container = container
        
        this.map = L.map(container,{
            zoomControl:container == 'map2',
            dragging: container == 'map2',
            doubleClickZoom: container == 'map2',
            scrollWheelZoom: container == 'map2'

        }).setView([0, 0], 2);

        this.drawControl = new L.Control.Draw({});
        // this.map.addControl(this.drawControl);

        this.openStreetMapMapnik = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        });
        this.openStreetMapMapnik.addTo(this.map);


        this.geoJSONLayer = L.geoJSON().addTo(this.map);



        this.createEventFirings();
        this.attachListeners();
}

addRaster(layer) {
    if (this.raster) map.removeLayer(this.raster);
    layer.addTo(this.map);

    const layerBounds = layer.getBounds();
    this.map.fitBounds(layerBounds);

    L.rectangle(layerBounds, {
        color: "#ff0000",
        fillOpacity: 0,
        weight: 1
    }).addTo(this.map);

    this.raster = layer;
}

createEventFirings(){
    let publishViewChange = (e)=>{
        console.log(e)
        PubSub.publish("CHANGE_VIEW",{
            source:this.container,
            bounds:this.map.getBounds(),
            center: this.map.getCenter()
        })
    }
    if(this.container == 'map2'){
        this.map.on('zoomend', (e)=>{
            publishViewChange(e);
        });
        this.map.on('moveend', (e)=>{
            publishViewChange(e);
        });

        this.map.on('draw:created',e=>{
            let l = e.layer
            let coordinates = [
                [
                    [l.getBounds().getNorthWest().lng,l.getBounds().getNorthWest().lat],
                    [l.getBounds().getNorthEast().lng,l.getBounds().getNorthEast().lat],
                    [l.getBounds().getSouthEast().lng,l.getBounds().getSouthEast().lat],
                    [l.getBounds().getSouthWest().lng,l.getBounds().getSouthWest().lat],
                    [l.getBounds().getNorthWest().lng,l.getBounds().getNorthWest().lat]
                ]
            ]
            console.log(coordinates)
            this.geoJSONLayer.addData({
                type: "Feature",
                geometry: {
                  type: "Polygon",
                  coordinates: coordinates
                }
              })
            this.stopDrawRectangle()
        })
    }
    
}

attachListeners(){
    PubSub.subscribe('ADD_RASTER',(msg, data)=>{
        if(data.map == this.container){
            let that = this
            RasterService.createRaster(data.file).then((raster)=>{
                that.addRaster(raster)
            })
        }
    })

    PubSub.subscribe('CHANGE_VIEW',(msg, data)=>{
        if(data.source !== this.container){
            if(this.map.getBounds!==data.bounds){
                this.map.fitBounds(data.bounds);
            }
        }
    })

    PubSub.subscribe('DRAW_BBOX',(msg, data)=>{
        if(this.container == 'map2'){
            this.startDrawRectangle();
        }
    })

    PubSub.subscribe('DOWNLOAD_GEOJSON',(msg, data)=>{
        if(this.container == 'map2'){
            this.downloadGeoJSON();
        }
    })

    PubSub.subscribe('UPLOAD_GEOJSON',(msg, data)=>{
        if(data.map == this.container){
            this.uploadGeoJSON(data.file)
        }
    })
}

startDrawRectangle() {
    if(!this.is_drawing){
        this.is_drawing = true;
        this.rectangleDrawer = new L.Draw.Rectangle(this.map, this.drawControl.options.rectangle);
        this.rectangleDrawer.enable();
    }
  }

  stopDrawRectangle() {
    if (this.rectangleDrawer) {
      this.rectangleDrawer.disable();
      this.is_drawing=false
    }
  }

  downloadGeoJSON(){
    let geoJson = this.geoJSONLayer.toGeoJSON();
    var jsonData = JSON.stringify(geoJson);
    var blob = new Blob([jsonData], { type: 'application/json' });
    FileSaver.saveAs(blob,'detections.geojson')
  }

  uploadGeoJSON(file){
    let reader = new FileReader();
    let that = this;
    reader.onload = function(e) {
        var content = e.target.result;
        var jsonData = JSON.parse(content);
        
        that.geoJSONLayer.addData(jsonData)
        console.log(jsonData);
      };

    reader.readAsText(file);
  }

}
export default Map
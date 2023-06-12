import Map from "./Map.js"
import PubSub from 'pubsub-js'



var map1 = new Map("map1")
var map2 = new Map("map2")

let importPreButton = document.getElementById('import1')
importPreButton.addEventListener('change', function(event) {
    var file = event.target.files[0];
    PubSub.publish("ADD_RASTER",{map:'map1',file:file})
  });

let importPostButton = document.getElementById('import2')
importPostButton.addEventListener('change', function(event) {
    var file = event.target.files[0];
    PubSub.publish("ADD_RASTER",{map:'map2',file:file})
  });

let drawbboxButton = document.getElementById('drawBbox')
drawbboxButton.addEventListener('click', function(event) {
      PubSub.publish("DRAW_BBOX",{})
    });

let downloadGeoJSON = document.getElementById('downloadGeoJSON')
downloadGeoJSON.addEventListener('click', function(event) {
        PubSub.publish("DOWNLOAD_GEOJSON",{})
    });
let uploadGeoJSON = document.getElementById('uploadGeoJSON')
uploadGeoJSON.addEventListener('change', function(event) {
    var file = event.target.files[0];
    PubSub.publish("UPLOAD_GEOJSON",{map:'map2',file:file})
    });
  

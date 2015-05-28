# vector-tile-layer

This repo contains an experimental layer extenstion to the ArcGIS Javascript API v3.\* for rendering tiles adhering to the [Mapbox Vector Tile Specification](https://github.com/mapbox/vector-tile-spec). 

The goal of this work is to explore ways to render vector tiles in the ArcGIS JS API and style them with Esri's Cartographic JSON Renderers commonly found in FeatureServices and Webmap JSON data.

### [Live Demo](https://arcgis.github.io/vector-tile-layer/examples/index.html)

## How this works

There are 2 layer extensions in this repo. The first is a `CanvasTileLayer` which extends `TiledMapServiceLayer`. This layer creates a grid of canvas tiles on the map. Each canvas element is where data eventually get rendered. The second extension is a `PbfTileLayer` which extends the `CanvasTileLayer` with logic that is specfic to parsing Protocol Buffer tiles and applying JSON renderers to features on a canvas.

### Creating the layer

```javascript
map = new Map("mapCanvas", {
  center: [-99.076, 38.132],
  zoom: 4,
  maxZoom: 6,
  basemap: "gray"
});

map.on("load", mapLoaded);

function mapLoaded() {
  var urlTmpl = 'http://koop.dc.esri.com/github/chelm/geodata/us-counties2/tiles/{level}/{col}/{row}.pbf';
  pbfLayer = new PbfTileLayer(urlTmpl, {
    buffer: 0,
    styles: { 
        'us-counties2': {
          'minZoom': 2,
          'maxZoom': 6,
          'renderer':{
            type: "simple",
            symbol: {
              type: "esriSFS",
              style: "esriSFSSolid",
              color: [ 154, 238, 49, .7 ],
              outline: {
                type: "esriSLS",
                style: "esriSLSSolid",
                color: [155,155,155,.5],
                width: .5
              }
            }
          }
        }
    }
  });
  map.addLayer(pbfLayer);
}
```

### Parsing 

We use 2 awesome libraries from Mapbox for parsing the vector tile data: 

* [https://github.com/mapbox/pbf](https://github.com/mapbox/pbf)
* [https://github.com/mapbox/vector-tile-js](https://github.com/mapbox/vector-tile-js)

Tile data are requested from a server as Array Buffers and converted into a JSON structure before being rendering to the canvas.

## Tile Sources

There are currently only a few sources of protocol buffer tiles. This layer also takes a very simple approach to pulling tiles from a tile server. It treats tiles just like other standard tile resources that follow the url template of `{Z}/{X}/{Y}.pbf`. A few public sources of data are: 

* [http://wiki.openstreetmap.org/wiki/Vector_tiles](http://wiki.openstreetmap.org/wiki/Vector_tiles)
* [https://github.com/mapzen/vector-datasource](https://github.com/mapzen/vector-datasource) 

We are also building vector tile support into Koop: 

* [https://github.com/koopjs/koop-tile-plugin](https://github.com/koopjs/koop-tile-plugin)

## Planned Work 

As vector tiles become more central to the ArcGIS platform, this code will continue to grow as neccessary to support changes in the Vector Tile spec and new features Esri is planning on contributing to the vector tile space.

## Requirements

* [ArcGIS for JavaScript API](https://developers.arcgis.com/javascript/)
* [Mapbox Vector Tile Specification](https://github.com/mapbox/vector-tile-spec)

## Resources

* [ArcGIS for JavaScript API Resource Center](https://developers.arcgis.com/javascript/)
* [ArcGIS Blog](http://blogs.esri.com/esri/arcgis/)
* [twitter@esri](http://twitter.com/esri)
* [https://github.com/mapbox/pbf](https://github.com/mapbox/pbf)
* [https://github.com/mapbox/vector-tile-js](https://github.com/mapbox/vector-tile-js)

## Issues

Find a bug or want to request a new feature?  Please let us know by submitting an issue.  Thank you!

## Contributing

Anyone and everyone is welcome to contribute. Please see our [guidelines for contributing](https://github.com/esri/contributing).

## Licensing
Copyright 2015 Esri

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

A copy of the license is available in the repository's [license.txt]( ./license.txt) file.

[](Esri Tags: ArcGIS Web Mapping Vector Tile Layer)
[](Esri Language: JavaScript)

# vector-tile-layer

This repo contains an experimental layer extension to the ArcGIS Javascript API v3.\* that renders tiles adhering to the [Mapbox Vector Tile Specification](https://github.com/mapbox/vector-tile-spec). 

The goal of this work is to explore ways to render vector tiles in the ArcGIS JS API and style them with Esri's Cartographic JSON renderers commonly found in Esri FeatureServices and Webmap JSON data.

### [Live Demo](http://esri.github.io/vector-tile-layer/examples/index.html)

## How this works

There are 2 new layer "extensions/plugins" in this repo. The first is a `CanvasTileLayer` which extends `TiledMapServiceLayer`. This layer creates a grid of canvas tiles on the map instead of div or image tag. Each canvas element is where data will eventually be rendered. The second extension is a `PbfTileLayer` which extends the `CanvasTileLayer` with logic that is specfic to parsing Protocol Buffer tiles and applying JSON renderers to features on a canvas.

## Future Work 

There is much work still do here, and we love to colloborate. Things that project needs: 

* Mouse events via a "hit-grid" sort of thing
* More renderer support (see the list below for the current renderer support) 


## Usage 

Below is a functional example of how to create a `PbfTileLayer` and add it to a map.

### Creating the layer

```javascript

// create a new map
var map = new Map("mapCanvas", {
  center: [-99.076, 38.132],
  zoom: 4,
  maxZoom: 10,
  basemap: "gray"
});

// the url template points to tiles server with the {Z}/{X}/{Y}.* tile structure.
var urlTemplate = 'http://someserver.com/tiles/{level}/{col}/{row}.pbf';

// create the new PbfTileLayer, with the url template and give it a style
// the styles use layer names in tiles to apply a style so names need to match 
var pbfLayer = new PbfTileLayer(urlTemplate, {
  styles: { 
      'tile-layer-name': {
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

// Add the layer to the map
map.addLayer(pbfLayer);
```

### Parsing Data

There are two modules used to parse PBF data. Tile data are requested from a server as Array Buffers and converted into a JSON structure before being rendering to the canvas. 

* [https://github.com/mapbox/pbf](https://github.com/mapbox/pbf)
* [https://github.com/mapbox/vector-tile-js](https://github.com/mapbox/vector-tile-js)

Both of these libraries are licensed under the [http://en.wikipedia.org/wiki/BSD_licenses](BSD License)

```javascript

// where data is a typed array return from a request to the server for a tile
var tile = new VectorTile( new Pbf( data ) );

```


## Tile Sources

There are currently only a few sources of protocol buffer tiles. This layer also takes a very simple approach to pulling tiles from a tile server. It treats tiles just like other standard tile resources that follow the url template of `{Z}/{X}/{Y}.pbf`. A few public sources of data are: 

* [http://wiki.openstreetmap.org/wiki/Vector_tiles](http://wiki.openstreetmap.org/wiki/Vector_tiles)
* [https://github.com/mapzen/vector-datasource](https://github.com/mapzen/vector-datasource) 

We are also building vector tile support into Koop: 

* [https://github.com/koopjs/koop-tile-plugin](https://github.com/koopjs/koop-tile-plugin)

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

define(
[
  "dojo/_base/declare",
  "dojo/_base/connect",
  "dojo/_base/lang",
  "dojo/_base/array",
  "dojo/_base/url",
  "dojo/dom-construct",
  "dojo/dom-class",
  "dojo/dom-geometry",
  "dojo/dom-style",
  "dojox/collections/ArrayList",
  "dojox/gfx/matrix",
  "dojo/has",
  "dojo/string",
  
  "esri/kernel",
  "esri/request",
  "esri/urlUtils",
  "esri/tileUtils",
  "esri/SpatialReference",
  "esri/geometry/Extent",
  "esri/geometry/Rect",
  
  "esri/layers/TiledMapServiceLayer",
  "esri/layers/TileInfo"
],
function(
  declare, connection, lang, array, Url, domConstruct, domClass, domGeom, domStyle,
  ArrayList, gfxMatrix, has, string,
  esriNS, esriRequest, urlUtils, tileUtils, SpatialReference, Extent, Rect,
  TiledMapServiceLayer, TileInfo
) {

var CanvasTileLayer = declare(TiledMapServiceLayer, {
  declaredClass: "esri.layers.CanvasTileLayer",
  
  constructor: function ( /*string*/ urlTemplate, /*Object?*/ options) {
    if (!options) {
      options = {};
    }

    this.urlTemplate = urlTemplate;
    this.options = options;
    this.res = options.res || (window.devicePixelRatio || 1);
    this.buffer = options.buffer || 0;
    this.styles = options.styles;    

    var initialExt = new Extent(-20037508.342787, -20037508.342780, 20037508.342780, 20037508.342787, new SpatialReference({ wkid:102100 }));
    var fullExt = new Extent(-20037508.342787, -20037508.342780, 20037508.342780, 20037508.342787, new SpatialReference({ wkid:102100 }));
    //if initial extent/full extent is not specified in the options,
    //the default ones covers the world area
    this.initialExtent = options.initialExtent || initialExt;
    this.fullExtent = options.fullExtent || fullExt;
    //users can set tileInfo through options.
    //if not provided, it applies a default tileInfo
    if (options.tileInfo) {
      this.tileInfo = options.tileInfo;
    }
    else {
      var lods = [{ "level": 0, "resolution": 156543.033928, "scale": 591657527.591555 },
        { "level": 1, "resolution": 78271.5169639999, "scale": 295828763.795777 },
        { "level": 2, "resolution": 39135.7584820001, "scale": 147914381.897889 },
        { "level": 3, "resolution": 19567.8792409999, "scale": 73957190.948944 },
        { "level": 4, "resolution": 9783.93962049996, "scale": 36978595.474472 },
        { "level": 5, "resolution": 4891.96981024998, "scale": 18489297.737236 },
        { "level": 6, "resolution": 2445.98490512499, "scale": 9244648.868618 },
        { "level": 7, "resolution": 1222.99245256249, "scale": 4622324.434309 },
        { "level": 8, "resolution": 611.49622628138, "scale": 2311162.217155 },
        { "level": 9, "resolution": 305.748113140558, "scale": 1155581.108577 },
        { "level": 10, "resolution": 152.874056570411, "scale": 577790.554289 },
        { "level": 11, "resolution": 76.4370282850732, "scale": 288895.277144 },
        { "level": 12, "resolution": 38.2185141425366, "scale": 144447.638572 },
        { "level": 13, "resolution": 19.1092570712683, "scale": 72223.819286 },
        { "level": 14, "resolution": 9.55462853563415, "scale": 36111.909643 },
        { "level": 15, "resolution": 4.77731426794937, "scale": 18055.954822 },
        { "level": 16, "resolution": 2.38865713397468, "scale": 9027.977411 },
        { "level": 17, "resolution": 1.19432856685505, "scale": 4513.988705 },
        { "level": 18, "resolution": 0.597164283559817, "scale": 2256.994353 },
        { "level": 19, "resolution": 0.298582141647617, "scale": 1128.497176 }
      ];
      var tileInfo = new TileInfo({
        "rows": 256,
        "cols": 256,
        "origin": {
          "x": -20037508.342787,
          "y": 20037508.342787
        },
        "spatialReference": {
          "wkid": 102100
        },
        "lods": lods
      });
      this.tileInfo = tileInfo;
    }    
  
    this.spatialReference = new SpatialReference(this.tileInfo.spatialReference.toJson());
    this.copyright = options.copyright || "";
    
    var url = new Url(urlTemplate);
  
    if (url.scheme){ 
      var tileServer = url.scheme + "://" + url.authority + "/";
      this.urlPath = urlTemplate.substring(tileServer.length);    
      this.tileServers = options.tileServers || [];
      if (url.authority.indexOf("{subDomain}") === -1) {
        this.tileServers.push(tileServer);
      }
    } else {
      var locationParts = location.href.split('/');
      var file = locationParts.pop();
      var tileServer = locationParts.join('/');
      this.urlPath = urlTemplate;
      this.tileServers = options.tileServers || [];
      this.tileServers.push(tileServer);
    }
    //if subDomains parameter is provided.    
    if (options.subDomains && options.subDomains.length > 0 && url.authority.split(".").length > 1) {
      this.subDomains = options.subDomains;
      var subDomainTileServer;
      array.forEach(options.subDomains, function(subDomain, idx){
        if (url.authority.indexOf("${subDomain}") > -1) {
          subDomainTileServer = url.scheme + "://" + string.substitute(url.authority, {subDomain: subDomain}) + "/";
        }
        else if (url.authority.indexOf("{subDomain}") > -1) {
          subDomainTileServer = url.scheme + "://" + url.authority.replace(/\{subDomain\}/gi, subDomain) + "/";
        }        
        this.tileServers.push(subDomainTileServer);        
      }, this);
    }
    
    this.tileServers = array.map(this.tileServers, function(item){ 
      if (item.charAt(item.length - 1) !== "/") {
        item += "/";
      }
      return item;
    });


    // object to save tile data, to reuse data
    this._tileData = {};
    this._tileDom = {};
    this._tileDivs = {};

    this.loaded = true;
    this.onLoad(this);
  },

  getTileUrl: function (level, row, col) {
    
    var tileUrl = this.tileServers[row % this.tileServers.length] + 
      string.substitute(
        this.urlPath, 
        {
          level: level, 
          col: col, 
          row: row
        }
      );
    
    tileUrl = tileUrl.replace(/\{level\}/gi, level)
      .replace(/\{row\}/gi, row)
      .replace(/\{col\}/gi, col);
    
    tileUrl = this.addTimestampToURL(tileUrl);
    
    return urlUtils.addProxy(tileUrl);
  },

  // override this method to create canvas elements instead of img
  _addImage: function(level, row, r, col, c, id, tileW, tileH, opacity, tile, offsets){
    var self = this;
    tileW += this.buffer*2,
    tileH += this.buffer*2;

    var canvas = domConstruct.create("canvas"),
      dc = connection.connect;

    this._tiles[id] = this._tileDom[id] = canvas;
    this._tileDivs[id] = this._div;

    canvas.id = id;
    domClass.add(canvas, "layerTile");

    var left = ((tileW-(this.buffer*2)) * col) - (offsets.x-(this.buffer/2)), top = ((tileH-(this.buffer*2)) * row) - (offsets.y-(this.buffer/2)),
        map = this._map, names = esriNS._css.names,
        css = {
          width: (tileW) + "px",
          height: (tileH) + "px",
          //border: '1px solid blue'
        };

    tileW *= this.res;
    tileH *= this.res;

    canvas.width = tileW;
    canvas.height = tileH;

    if (map.navigationMode === "css-transforms") {
      css[names.transform] = esriNS._css.translate(left-this.buffer, top-this.buffer);
      domStyle.set(canvas, css);

      canvas._left = left;
      canvas._top = top;
      domStyle.set(canvas, css);
    }

    canvas._onload_connect = dc(canvas, "onload", this, "_tileLoadHandler");
    canvas._onerror_connect = dc(canvas, "onerror", lang.hitch(this, "_tileErrorHandler", r, c));
    canvas._onabort_connect = dc(canvas, "onabort", this, "_tileAbortHandler");

    if (map.navigationMode === "css-transforms") {
      this._active.appendChild(canvas);
    }
    else {
      this._div.appendChild(canvas);
    }

    // implemented by subclasses
    this._loadTile(id, level, r, c, canvas);
  },

  refreshStyles: function( styles ){
  },

  _loadTile: function(level, r, c, canvas){
  },

  _render: function(element, data, tile, callback){
  },

  _colorToHex: function(color){
    return (color && color.length === 4) ? "#" +
      ("0" + parseInt(color[0],10).toString(16)).slice(-2) +
      ("0" + parseInt(color[1],10).toString(16)).slice(-2) +
      ("0" + parseInt(color[2],10).toString(16)).slice(-2) : '';
  }

});

if (has("extend-esri")) {
  lang.setObject("layers.CanvasTileLayer", CanvasTileLayer, esriNS);
}

return CanvasTileLayer;  
});

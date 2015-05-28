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
  
  "plugins/CanvasTileLayer",
  "queue"
],
function(
  declare, connection, lang, array, Url, domConstruct, domClass, domGeom, domStyle,
  ArrayList, gfxMatrix, has, string,
  esriNS, esriRequest, urlUtils, tileUtils, SpatialReference, Extent, Rect,
  CanvasTileLayer, queue
) {

var PbfTileLayer = declare(CanvasTileLayer, {
  declaredClass: "esri.layers.PbfTileLayer",
  
  constructor: function ( urlTemplate, options) {
    this.inherited(arguments);
    this.tileQ = queue(4);
  },

  // override this method to create canvas elements instead of img
  _addImage: function(level, row, r, col, c, id, tileW, tileH, opacity, tile, offsets){
    this.inherited(arguments);
  },

  // loads a tile from a host
  // parses it, saves it, renders it
  _loadTile: function(id, level, r, c, element){
    var self = this;
    //if (!this._tileData[id]){
      this._getTile(this.getTileUrl(level, r, c), function(err, data){
        if (!err && data){
          try {
            self.tileQ.defer(function(id, callback){
              setTimeout(function() {
                try {
                  var tile = new VectorTile( new Pbf( data ) );
                  //self._tileData[id] = tile;
                  self._render(element, tile, id, function(){
                    callback(null, null);
                  });  
                } catch(e) {
                  console.log('Error parsing tile data', e); 
                  callback(null, null);
                }
              }, 25);
            }, id);
          } catch(e){
            console.log('Error fetching tile', e); 
          }
        }
      });
    //} else {
    //  self._render(element, this._tileData[id], id, function(){});
    //}
    self._loadingList.remove(id);
    self._fireOnUpdateEvent();
  },

  _getTile: function(url, callback){
     var _xhr = new XMLHttpRequest();
     _xhr.open( "GET", url, true );
     _xhr.responseType = "arraybuffer";
     _xhr.onload = function( evt ) {
       var arrayBuffer = _xhr.response;
       if ( arrayBuffer ) {
         var byteArray = new Uint8Array( arrayBuffer );
         callback(null, byteArray); 
       }
     }
     _xhr.send(null);
  },

  refreshStyles: function( styles ){
    this.styles = styles;
    for (var id in this._tileData){
      this._render( this._tileDom[id], this._tileData[id].tile, function(){} );
    }
  },

  _render: function(canvas, tile, id, callback){
    var start = Date.now();
    var self = this;
    var context = canvas.getContext('2d');
    var width = canvas.width, height=canvas.height;
    context.clearRect(0, 0, width, height);

    for (var name in this.styles){
      if ( tile && tile.layers[name] && tile.layers[name]._features.length){
        // apply the style for each layer and send the features
        this._applyStyle(this.styles[name], tile.layers[name], context); 
      }
    }
    callback();
  },

  _asyncLoop: function(iterations, func, callback) {
    var index = 0;
    var done = false;
    var loop = {
      next: function() {
        if (done) {
          return;
        }
        if (index < iterations) {
          index++;
          func(loop);
        } else {
          done = true;
          callback();
        }
      },

      iteration: function() {
        return index - 1;
      },

      break: function() {
        done = true;
        callback();
      }
    };
    loop.next();
    return loop;
  },

  _applyStyle: function(style, layer, context){
    var self = this, feature;
    var cnt = 0;
    var renderer = style.renderer;
    var z = this._map.getZoom();
    if (style.minZoom && style.maxZoom && (z <= style.maxZoom && z >= style.minZoom)){

      if (renderer.type == 'simple'){

        self._asyncLoop(layer.length, function(loop) {
          feature = layer.feature(loop.iteration()); 
          self[ renderer.symbol.type ]( feature, context, renderer, function(){
            cnt++; 
            loop.next();
          })},
          // final callback;
          function(){
            //console.log(cnt);
          }
        );

      } else if ( renderer.type == 'uniqueValue' ){

        var field = renderer.field1;
        var i = 0;
        self._asyncLoop(layer.length, function(loop) {
            i = loop.iteration();
            feature = layer.feature(i);
            var val = feature.properties[field];

            renderer.uniqueValueInfos.forEach( function(uniqStyle ){
              if ( val 
                && ( (Array.isArray(uniqStyle.value) && uniqStyle.value.indexOf(val) != -1) 
                || val == uniqStyle.value)) {

                self[uniqStyle.symbol.type]( feature, context, uniqStyle, function(){});

              } else {
                // apply default symbol
                if (!feature._drawn && renderer.defaultSymbol){
                  self[renderer.defaultSymbol.type]( feature, context, { symbol: renderer.defaultSymbol }, function(){
                  });
                }
              }
            });
            loop.next();
          }, function(){}
        );
       
      } else if (renderer.type == 'classBreaks'){
        var field = renderer.field;
        layer._features.forEach(function( f,i ){
          feature = layer.feature(i);
          renderer.classBreakInfos.forEach( function( classStyle ){
            if (feature.properties[field] <= classStyle.classMaxValue && !feature._drawn ){
              if (renderer.visualVariables){
                classStyle.visualVariables = renderer.visualVariables;
              }
              self[ classStyle.symbol.type]( feature, context, classStyle, function(){} );
            }
          });
        });
      }
    }
    
  },

  esriSFS: function(feature, context, style, callback){
    var size = 256;
    context.fillStyle = this._colorInfo( feature, style );

    if (style.symbol.outline.width){
      context.strokeStyle = 'rgba('+style.symbol.outline.color.join(',')+')';
      context.lineWidth = style.symbol.outline.width;
    }

    context.beginPath();
    this._drawFeature(feature, context, size);
    context.closePath();
    context.fill();

    if (style.symbol.outline.width) {
      context.stroke();
    }
    feature._drawn = true;
    return callback();
  },

  esriSLS: function( feature, context, style, callback ){
    context.strokeStyle = 'rgba('+style.symbol.color.join(',')+')';
    context.lineWidth = style.symbol.width;
    if (style.symbol.style && style.symbol.style == 'esriSLSDashed'){
      context.setLineDash([5]);
    } else {
      context.setLineDash([0]);
    }
    context.beginPath();

    var size = 256;
    var geom = feature.loadGeometry();
    for (var r=0; r < geom.length; r++) {
        var ring = geom[r];
        for (var c=0; c < ring.length; c++) {
        
            var x = Math.floor(ring[c].x/4096*size),
              y = Math.floor(ring[c].y/4096*size);

            x *= this.res;
            y *= this.res;

            if (c == 0){
              context.moveTo(x,y);
            } else {
              context.lineTo(x,y);
            }
        }
    }

    context.stroke();
    feature._drawn = true;
    return callback();
  },

  esriSMS: function( feature, context, style, callback ){

    context.lineWidth = style.symbol.outline.width;
    context.fillStyle = this._colorInfo( feature, style );
    context.strokeStyle = 'rgba('+style.symbol.outline.color.join(',')+')';

    var geom = feature.loadGeometry();

    var x = geom[0][0].x;
    var y = geom[0][0].y;
    var size = 256;
    x = x/4096*size;
    y = y/4096*size;
    x *= this.res;
    y *= this.res;
    context.beginPath();
    context.arc(x, y, this._sizeInfo(feature, style, 'size'), 0, 2 * Math.PI, true);
    context.fill();
    context.stroke();
    feature._drawn = true;

    /*if (style.labelField && feature.properties[style.labelField]){
      context.font = "12px 'Open Sans'";
      context.fillStyle = '#555';
      context.fillText(feature.properties[style.labelField], x+5, y-1);
    }*/

    return callback();
  },

  _drawFeature: function(feature, context, size){
    var geom = feature.loadGeometry();
    for (var r=0; r < geom.length; r++) {
        var ring = geom[r];
        for (var c=0; c < ring.length; c++) {
            var x = Math.floor(ring[c].x/4096*size),
              y = Math.floor(ring[c].y/4096*size);

            x *= this.res;
            y *= this.res;

            if (c == 0){
              context.moveTo(x,y);
            } else {
              context.lineTo(x,y);
            }
        }
    }
  },

  _colorInfo: function( feature, style){
    var color = 'rgba('+style.symbol.color.join(',')+')';
    if (style.visualVariables){
      style.visualVariables.forEach(function(vizVar){
        if (vizVar.type == "colorInfo" && feature.properties[vizVar.field]){
          var val = feature.properties[vizVar.field];
          for (var s = 1; s < vizVar.stops.length; s++){
            if (val > vizVar.stops[s-1].value && val < vizVar.stops[s].value){
              color = 'rgba('+vizVar.stops[s-1].color.join(',')+')';
            } else {
              //console.log(vizVar.stops[s-1].value, val, vizVar.stops[s].value);
            }
          }
        }
      });
    }
    return color;
  },

  _sizeInfo: function(feature, style, prop){
    var size = style.symbol[prop];
    if (style.visualVariables){
      style.visualVariables.forEach(function(vizVar){
        if (vizVar.type == "sizeInfo" && feature.properties[vizVar.field]){
          var val = feature.properties[vizVar.field];
          if (val <= vizVar.maxDataValue && val >= vizVar.minDataValue){
            size = Math.floor(( (vizVar.minSize + ((val/vizVar.maxDataValue)*vizVar.maxSize)) || vizVar.minSize ));
          } else {
            size = 0;
          }
        }
      });
    }
    return size;
  },

  _colorToHex: function(color){
    return (color && color.length === 4) ? "#" +
      ("0" + parseInt(color[0],10).toString(16)).slice(-2) +
      ("0" + parseInt(color[1],10).toString(16)).slice(-2) +
      ("0" + parseInt(color[2],10).toString(16)).slice(-2) : '';
  },


});

if (has("extend-esri")) {
  lang.setObject("layers.PbfTileLayer", PbfTileLayer, esriNS);
}

return PbfTileLayer;  
});

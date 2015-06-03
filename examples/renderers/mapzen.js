var renderers = { 
  'earth': {
    'minZoom': 1,
    'maxZoom': 20,
    'renderer':{
      type: "simple",
      symbol: {
        type: "esriSFS",
        color: [ 246,241,231, 1 ],
        outline: {
          type: "esriSLS",
          style: "esriSLSSolid",
          color: [255,255,255,0.5],
          width: 0
        }
      }
    }
  },
  'water': {
    'minZoom': 1,
    'maxZoom': 20,
    'renderer':{
      "type": "uniqueValue",
      "field1": "kind",
      "uniqueValueInfos": [{
        "value": [ "river", "stream", "water", "canal", "dam", "ditch"],
        "symbol": {
          "color": [140, 203, 255, 1],
          "width": 1,
          "type": "esriSLS",
        }
      },{
        "value": [ "ocean", "lake", "reservoir" ],
        "symbol": {
          type: "esriSFS",
          color: [ 140, 203, 255, 1 ],
          outline: {
            type: "esriSLS",
            style: "esriSLSSolid",
            color: [255,255,255,0.5],
            width: 0
          }
        }
      }]
    }
  },
  'landuse': {
    'minZoom': 1,
    'maxZoom': 20,
    'renderer':{
      "type": "uniqueValue",
      "field1": "kind",
      "uniqueValueInfos": [{
        "value": [ "urban area" ],
        "symbol": {
          "color": [ 235,226,218, 1 ],
          "width": 1,
          "type": "esriSLS",
        }
      }]
    } 
  },
  'landuse': {
    'minZoom': 1,
    'maxZoom': 20,
    'renderer':{
      "type": "simple",
      "symbol": {
        type: "esriSFS",
        color: [ 196,245,159, 1 ],
        outline: {
          type: "esriSLS",
          style: "esriSLSSolid",
          color: [255,255,255,0.5],
          width: 0
        }
      }
    }
  }, 
  'Administrative Lines': {
    'minZoom': 1,
    'maxZoom': 20,
    'renderer':{
      "type": "uniqueValue",
      "field1": "CLASS",
      "uniqueValueInfos": [{
        "value": [ "01010", "01100", "01110"],
        "symbol": {
          "color": [176,150,224, 1],
          "width": 1,
          "type": "esriSLS",
          "style": "esriSLSDashed"
        }
      },{
        "value": [ "11100", "11110", "11010" ],
        "symbol": {
          "color": [176,150,224, .5],
          "width": 5,
          "type": "esriSLS"
        }
      },{
        "value": [ "11100", "11110", "11010" ],
        "symbol": {
          "color": [176,150,224, 1],
          "width": 2,
          "type": "esriSLS"
        }
      }]
    }
  },
  'roads': {
    'minZoom': 1,
    'maxZoom': 20,
    'renderer':{
      "type": "uniqueValue",
      "field1": "kind",
      "uniqueValueInfos": [{
        "value": ['highway'],
        "symbol": {
          "color": [255,154,66, 1],
          "width": 5.5,
          "type": "esriSLS",
        }
      },{
        "value": ['highway'],
        "symbol": {
          "color": [255,248,235, 1],
          "width": 4,
          "type": "esriSLS",
        }
      },{
        "value": ["major_road"],
        "symbol": {
          "color": [255,154,66, 1],
          "width": 3.5,
          "type": "esriSLS",
        }
      },{
        "value": ["major_road"],
        "symbol": {
          "color": [255,238,143, 1],
          "width": 2,
          "type": "esriSLS",
        }
      },{
      "value": ["minor_road"],
        "symbol": {
          "color": [178, 178, 178, 1],
          "width": 2.5,
          "type": "esriSLS",
        }
      },{
        "value": ["minor_road"],
        "symbol": {
          "color": [255,238,143, 1],
          "width": 2,
          "type": "esriSLS",
        }
      },{
        "value": ["path"],
        "symbol": {
          "color": [255,238,238, 1],
          "width": 2,
          "type": "esriSLS",
        }
      }]
    }
  },
  'buildings': {
    'minZoom': 1,
    'maxZoom': 20,
    'renderer':{
      "type": "simple",
      "symbol": {
        type: "esriSFS",
        color: [ 235,231,220,1 ],
        outline: {
          type: "esriSLS",
          style: "esriSLSSolid",
          color: [209,202,197,1],
          width: .5
        }
      }
    }
  },
  'Cities': {
    'minZoom': 1,
    'maxZoom': 20,
    'renderer':{
      "type": "uniqueValue",
      "field1": "PCLASS",
      "uniqueValueInfos": [{
        "value": [6],
        "symbol": {
          "type": "esriSMS",
          "color": [255,255,255, 1],
          "size": 4,
          "outline": {
            "type":  "esriSLS",
            "style": "esriSLSSolid",
            "color": [ 0, 0, 0, 1 ],
            "width": .5
          }
        },
        "labelField": "name"
      }]
    }
  }
};


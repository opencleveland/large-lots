var map;
var lastClickedLayer;
var geojson;

function style(feature) {
  return {
    weight: 0.5,
    opacity: 1,
    color: '#00441b',
    fillOpacity: 1,
    fillColor: getColor(feature.properties.ZONING_CLA)
  };
}

function parseParams(query){
    var re = /([^&=]+)=?([^&]*)/g;
    var decodeRE = /\+/g;  // Regex for replacing addition symbol with a space
    var decode = function (str) {return decodeURIComponent( str.replace(decodeRE, " ") );};
    var params = {}, e;
    while ( e = re.exec(query) ) {
        var k = decode( e[1] ), v = decode( e[2] );
        if (k.substring(k.length - 2) === '[]') {
            k = k.substring(0, k.length - 2);
            (params[k] || (params[k] = [])).push(v);
        }
        else params[k] = v;
    }
    return params;
}

function areaStyle(feature) {
  return {
    weight: 3,
    opacity: 1,
    color: 'white',
    dashArray: '3',
    fillOpacity: 0.4,
    fillColor: '#ffffcc'
  };
}

function getColor(ZONING_CLA) {
  if (checkZone(ZONING_CLA, "RS")) return "#a1d99b";
  if (checkZone(ZONING_CLA, "RT")) return "#41ab5d";
  if (checkZone(ZONING_CLA, "RM")) return "#006d2c";

}

function checkZone(ZONING_CLA, value) {
  if (ZONING_CLA.indexOf(value) != -1)
    return true;
  else
    return false;
}

function formatAddress(prop) {
  return prop.STREET_NUM + " " + prop.DIR + " " + prop.STREET_NAM + " " + prop.TYPE;
}

function selectParcel(feature, layer){
    var props = feature.properties;
    var address = formatAddress(props);
    var alderman = getAlderman(props.WARD);
    var info = "<p>Selected lot: </p><img class='img-responsive img-thumbnail' src='http://cookviewer1.cookcountyil.gov/Jsviewer/image_viewer/requestImg.aspx?" + props.PIN14 + "=' />\
      <p class='lead'>" + address + "</p>\
      <table class='table table-bordered table-condensed'><tbody>\
        <tr><td>PIN</td><td>" + props.PIN14 + "</td></tr>\
        <tr><td>Zoned</td><td>" + props.ZONING_CLA + "</td></tr>\
        <tr><td>Sq ft</td><td>" + props.SQ_FT + "</td></tr>\
        <tr><td>Alderman</td><td>" + alderman + " (Ward " + props.WARD + ")</td></tr>\
      </tbody></table>";
    $.address.value($.param({'pin': props.PIN14}))
    $('#lot-info').html(info);
    if (typeof lastClickedLayer !== 'undefined'){
        geojson.resetStyle(lastClickedLayer);
    }
    map.setView(layer.getBounds().getCenter(), 17);
    layer.setStyle({fillColor:'#f7fcb9', weight: 2});
    lastClickedLayer = layer;
}

function makeInfoBox(feature, layer){
    layer.on({
        click: function(e){
            selectParcel(feature, layer)
        }
    })
}

function getAlderman(ward){
    var lookup = {
        20: 'Willie B. Cochran',
        6: 'Roderick T. Sawyer',
        16: 'JoAnn Thompson',
        17: 'Latasha Thomas'
    }
    return lookup[ward]
}

$.when( $.getJSON("data/build/full-area-parcels.geojson") ).then(function( data, textStatus, jqXHR ) {

  // render a map!
  map = L.map('map', {scrollWheelZoom: false}).setView([41.77809673652204, -87.63673782348633], 13);

  L.tileLayer('https://{s}.tiles.mapbox.com/v3/derekeder.hehblhbj/{z}/{x}/{y}.png', {
      attribution: '<a href="http://www.mapbox.com/about/maps/" target="_blank">Terms &amp; Feedback</a>'
  }).addTo(map);

  var legend = L.control({position: 'bottomleft'});
  legend.onAdd = function (map) {

      var div = L.DomUtil.create('div', 'info legend')
          
      div.innerHTML = '\
      <h4>Lot zoned for</h4>\
      <i style="background:' + getColor('RS') + '"></i> Single family home (RS)<br />\
      <i style="background:' + getColor('RT') + '"></i> Two-flat, townhouse (RT)<br />\
      <i style="background:' + getColor('RM') + '"></i> Medium-density apartment (RM)<br />\
      ';
      return div;
  };

  legend.addTo(map);

  var large_lot_area = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              -87.6794707775116,
              41.80480591998922
            ],
            [
              -87.67939567565918,
              41.79387241854602
            ],
            [
              -87.67858028411864,
              41.79387241854602
            ],
            [
              -87.67854809761047,
              41.79205265330885
            ],
            [
              -87.67804384231567,
              41.75756333877295
            ],
            [
              -87.64424800872803,
              41.75805954667102
            ],
            [
              -87.64420509338379,
              41.75610670633012
            ],
            [
              -87.63931274414062,
              41.756186741938045
            ],
            [
              -87.6392912864685,
              41.75802753337404
            ],
            [
              -87.60294198989867,
              41.75861977678357
            ],
            [
              -87.60302782058716,
              41.76178898647152
            ],
            [
              -87.6055383682251,
              41.76372564867442
            ],
            [
              -87.60573148727417,
              41.77315203732289
            ],
            [
              -87.58618354797362,
              41.77334407159104
            ],
            [
              -87.58663415908813,
              41.786145059328256
            ],
            [
              -87.6157522201538,
              41.78571306765792
            ],
            [
              -87.61615991592407,
              41.80211070919728
            ],
            [
              -87.6164388656616,
              41.80316641357772
            ],
            [
              -87.61648178100586,
              41.80393418765675
            ],
            [
              -87.6259660720825,
              41.80383821640001
            ],
            [
              -87.63448476791382,
              41.8036622687226
            ],
            [
              -87.6404285430908,
              41.80348632056204
            ],
            [
              -87.64055728912354,
              41.80529376501766
            ],
            [
              -87.6409649848938,
              41.80529376501766
            ],
            [
              -87.64270305633545,
              41.805261775293516
            ],
            [
              -87.64544427394866,
              41.805217789396764
            ],
            [
              -87.6794707775116,
              41.80480591998922
            ]
          ]
        ]
      }
    }
  ]
}
;

  L.geoJson(large_lot_area, {
      style: areaStyle,
  }).addTo(map);

  geojson = L.geoJson(data, {
                    style: style,
                    onEachFeature: makeInfoBox
                }).addTo(map);

  geojson.eachLayer(function (layer) {
    var alderman = getAlderman(layer.feature.properties['WARD'])
    var popup = "<h4>" + formatAddress(layer.feature.properties) + "</h4>\
                <p>\
                  PIN: " + layer.feature.properties['PIN14'] + "<br />\
                  Zoned: " + layer.feature.properties['ZONING_CLA'] + "<br />\
                  Sq Ft: " + layer.feature.properties['SQ_FT'] + "<br />\
                  Alderman: " + alderman + " (Ward " + layer.feature.properties['WARD'] + ")\
                </p>";
    layer.bindLabel(popup);
  });
  if(window.location.hash){
      var query = parseParams($.address.value().replace('/', ''));
      geojson.eachLayer(function(layer){
          if (query.pin == layer.feature.properties.PIN14){
              selectParcel(layer.feature, layer);
          }
      });
  }

});
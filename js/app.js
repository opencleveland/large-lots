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

function pilotStyle(feature) {
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

$.when( $.getJSON("data/build/pilot-area.geojson") ).then(function( data, textStatus, jqXHR ) {

  // render a map!
  map = L.map('map', {scrollWheelZoom: false}).setView([41.76999939256138, -87.63888359069824], 15);

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

  var pilot_area = {
    "type": "FeatureCollection",
    "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
    "features": [
      { "type": "Feature", "properties": { "id": 1 }, "geometry": { "type": "Polygon", "coordinates": [ [ [ -87.634945541302741, 41.77652749479649 ], [ -87.630115898891958, 41.77658421447196 ], [ -87.627548962964951, 41.774443011928234 ], [ -87.626807403697171, 41.773152583821663 ], [ -87.626731346336371, 41.772812246807803 ], [ -87.626598245954966, 41.769238599137182 ], [ -87.626484159913758, 41.763650830396784 ], [ -87.650423214225469, 41.763267894416664 ], [ -87.650727443668686, 41.776017015460056 ], [ -87.634945541302741, 41.776243895666767 ], [ -87.634945541302741, 41.77652749479649 ] ] ] } }
      ]
    };

  L.geoJson(pilot_area, {
      style: pilotStyle,
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
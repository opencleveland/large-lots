var LargeLots = LargeLots || {};
var LargeLots = {

  map: null,
  lastClickedLayer: null,
  geojson: null,
  marker: null,
  locationScope: 'Chicago',

  initialize: function() {

    $.when( $.getJSON("data/build/full-area-parcels.geojson") ).then(function( data, textStatus, jqXHR ) {

      // render a map!
      LargeLots.map = L.map('map', {scrollWheelZoom: false}).setView([41.77809673652204, -87.63673782348633], 13);
      L.Icon.Default.imagePath = '/images/'

      L.tileLayer('https://{s}.tiles.mapbox.com/v3/derekeder.hehblhbj/{z}/{x}/{y}.png', {
          attribution: '<a href="http://www.mapbox.com/about/maps/" target="_blank">Terms &amp; Feedback</a>'
      }).addTo(LargeLots.map);

      var legend = L.control({position: 'bottomleft'});
      legend.onAdd = function (map) {

          var div = L.DomUtil.create('div', 'info legend')
              
          div.innerHTML = '\
          <h4>Lot zoned for</h4>\
          <i style="background:' + LargeLots.getColor('RS') + '"></i> Single family home (RS)<br />\
          <i style="background:' + LargeLots.getColor('RT') + '"></i> Two-flat, townhouse (RT)<br />\
          <i style="background:' + LargeLots.getColor('RM') + '"></i> Medium-density apartment (RM)<br />\
          ';
          return div;
      };

      legend.addTo(LargeLots.map);

      // large_lot_area defined in data/build/large-lot-boundary.geojson
      L.geoJson(large_lot_area, {
          style: LargeLots.areaStyle,
      }).addTo(LargeLots.map);

      geojson = L.geoJson(data, {
                        style: LargeLots.style,
                        onEachFeature: LargeLots.makeInfoBox
                    }).addTo(LargeLots.map);

      geojson.eachLayer(function (layer) {
        var alderman = LargeLots.getAlderman(layer.feature.properties['WARD'])
        var popup = "<h4>" + LargeLots.formatAddress(layer.feature.properties) + "</h4>\
                    <p>\
                      PIN: " + layer.feature.properties['PIN14'] + "<br />\
                      Zoned: " + layer.feature.properties['ZONING_CLA'] + "<br />\
                      Sq Ft: " + layer.feature.properties['SQ_FT'] + "<br />\
                      Alderman: " + alderman + " (Ward " + layer.feature.properties['WARD'] + ")\
                    </p>";
        layer.bindLabel(popup);
      });

      if($.address.parameter('pin') != ''){
          geojson.eachLayer(function(layer){
              if ($.address.parameter('pin') == layer.feature.properties.PIN14){
                  LargeLots.selectParcel(layer.feature, layer);
              }
          });
      }

      $("#search_address").val(LargeLots.convertToPlainString($.address.parameter('address')));
      LargeLots.addressSearch();

    });
  },

  style: function (feature) {
    return {
      weight: 0.5,
      opacity: 1,
      color: '#00441b',
      fillOpacity: 1,
      fillColor: LargeLots.getColor(feature.properties.ZONING_CLA)
    };
  },

  areaStyle: function (feature) {
    return {
      weight: 3,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.2,
      fillColor: '#ffffcc'
    };
  },

  getColor: function (ZONING_CLA) {
    if (LargeLots.checkZone(ZONING_CLA, "RS")) return "#a1d99b";
    if (LargeLots.checkZone(ZONING_CLA, "RT")) return "#41ab5d";
    if (LargeLots.checkZone(ZONING_CLA, "RM")) return "#006d2c";

  },

  checkZone: function (ZONING_CLA, value) {
    if (ZONING_CLA.indexOf(value) != -1)
      return true;
    else
      return false;
  },

  formatAddress: function (prop) {
    return prop.STREET_NUM + " " + prop.DIR + " " + prop.STREET_NAM + " " + prop.TYPE;
  },

  selectParcel: function (feature, layer){
      var props = feature.properties;
      var address = LargeLots.formatAddress(props);
      var alderman = LargeLots.getAlderman(props.WARD);
      var info = "<p>Selected lot: </p><img class='img-responsive img-thumbnail' src='http://cookviewer1.cookcountyil.gov/Jsviewer/image_viewer/requestImg.aspx?" + props.PIN14 + "=' />\
        <p class='lead'>" + address + "</p>\
        <table class='table table-bordered table-condensed'><tbody>\
          <tr><td>PIN</td><td>" + props.PIN14 + "</td></tr>\
          <tr><td>Zoned</td><td>" + props.ZONING_CLA + "</td></tr>\
          <tr><td>Sq ft</td><td>" + props.SQ_FT + "</td></tr>\
          <tr><td>Alderman</td><td>" + alderman + " (Ward " + props.WARD + ")</td></tr>\
        </tbody></table>";
      $.address.parameter('pin', props.PIN14)
      $('#lot-info').html(info);
      if (typeof lastClickedLayer !== 'undefined'){
          geojson.resetStyle(lastClickedLayer);
      }
      LargeLots.map.setView(layer.getBounds().getCenter(), 17);
      layer.setStyle({fillColor:'#f7fcb9', weight: 2});
      lastClickedLayer = layer;
  },

  makeInfoBox: function (feature, layer){
      layer.on({
          click: function(e){
              LargeLots.selectParcel(feature, layer)
          }
      })
  }, 

  getAlderman: function (ward){
      var lookup = {
          20: 'Willie B. Cochran',
          6: 'Roderick T. Sawyer',
          16: 'JoAnn Thompson',
          17: 'Latasha Thomas'
      }
      return lookup[ward]
  },

  addressSearch: function (e) {
    if (e) e.preventDefault();
    var searchRadius = $("#search_address").val();
    if (searchRadius != '') {

      var raw_address = $("#search_address").val().toLowerCase();
      raw_address = raw_address.replace(" n ", " north ");
      raw_address = raw_address.replace(" s ", " south ");
      raw_address = raw_address.replace(" e ", " east ");
      raw_address = raw_address.replace(" w ", " west ");

      if(LargeLots.locationScope && LargeLots.locationScope.length){
        var checkaddress = raw_address.toLowerCase();
        var checkcity = LargeLots.locationScope.split(",")[0].toLowerCase();
        if(checkaddress.indexOf(checkcity) == -1){
          raw_address += ", " + LargeLots.locationScope;
        }
      }

      $.address.parameter('address', encodeURIComponent(raw_address));

      var s = document.createElement("script");
      s.type = "text/javascript";
      s.src = "http://nominatim.openstreetmap.org/search/" + encodeURIComponent(raw_address) + "?format=json&json_callback=LargeLots.returnAddress";
      document.body.appendChild(s);
    }
  },

  returnAddress: function (response){
    
    if(!response.length){
      alert("Sorry, no results found for that location.");
      return;
    }

    var first = response[0];
    LargeLots.map.setView([first.lat, first.lon], 17);

    if (LargeLots.marker)
      LargeLots.map.removeLayer( LargeLots.marker );

    var defaultIcon = L.icon({
        iconUrl: 'images/marker-icon.png',
        shadowUrl: 'images/marker-shadow.png',
        shadowAnchor: [0, 0]
      });
    LargeLots.marker = L.marker([first.lat, first.lon]).addTo(LargeLots.map);
  },

  //converts a slug or query string in to readable text
  convertToPlainString: function (text) {
    if (text == undefined) return '';
    return decodeURIComponent(text);
  }

}
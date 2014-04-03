var LargeLots = LargeLots || {};
var LargeLots = {

  map: null,
  map_centroid: [41.77809673652204, -87.63673782348633],
  defaultZoom: 13,
  lastClickedLayer: null,
  geojson: null,
  marker: null,
  locationScope: 'Chicago',
  cartoLayerUrl: 'http://ericvanzanten.cartodb.com/api/v2/viz/414552ee-bacf-11e3-8a42-0edbca4b5057/viz.json',
  cartoTableName: 'englewood_large_lots',

  initialize: function() {

      if (!LargeLots.map) {
        LargeLots.map = new L.Map('map', {
          center: LargeLots.map_centroid,
          zoom: LargeLots.defaultZoom,
          scrollWheelZoom: false
        });
      }
      // render a map!
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
      LargeLots.info = L.control({position: 'bottomright'});

      LargeLots.info.onAdd = function (map) {
          this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
          this.update();
          return this._div;
      };

      // method that we will use to update the control based on feature properties passed
      LargeLots.info.update = function (props) {
        var date_formatted = '';
        if (props) {
          var info = "<h4>" + LargeLots.formatAddress(props) + "</h4>";
          info += "<p>PIN: " + props.pin14 + "<br />";
          info += "Zoned: " + props.zoning_classification + "<br />";
          info += "Sq Ft: " + props.sq_ft + "<br />";
          info += "Alderman: " + LargeLots.getAlderman(props.ward) + " (Ward " + props.ward + ")</p>";

          this._div.innerHTML  = info;
        }
      };

      LargeLots.info.addTo(LargeLots.map);

      var fields = "pin14,zoning_classification,ward,street_name,dir,street_number,type,sq_ft"
      LargeLots.dataLayer = cartodb.createLayer(LargeLots.map, LargeLots.cartoLayerUrl)
        .addTo(LargeLots.map)
        .on('done', function(layer) {
          var sublayer = layer.getSubLayer(0)
          sublayer.setInteraction(true);
          sublayer.set({interactivity:fields})
          sublayer.on('featureOver', function(e, latlng, pos, data, subLayerIndex) {
            LargeLots.info.update(data);
          });
          sublayer.on('featureClick', function(e, latlng, pos, data, subLayerIndex){
            console.log(data);
          })
        }).on('error', function() {
          //log the error
      });

      $("#search_address").val(LargeLots.convertToPlainString($.address.parameter('address')));
      LargeLots.addressSearch();

      // change the query for the first layer

  },

  style: function (feature) {
    return {
      weight: 0.5,
      opacity: 1,
      color: '#00441b',
      fillOpacity: 1,
      fillColor: LargeLots.getColor(feature.properties.zoning_classification)
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
    return prop.street_number + " " + prop.dir + " " + prop.street_name + " " + prop.type;
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
      $('#modalGeocode').modal('show');
      return;
    }

    var first = response[0];

    // check lat/long bounds and notify if outside our target area

    if (first.lat > 41.807788914288814 ||
        first.lat < 41.74378003152462 ||
        first.lon > -87.57219314575195 ||
        first.lon < -87.69750595092773) {

      $('#modalOutside').modal('show');
      return;
    }


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

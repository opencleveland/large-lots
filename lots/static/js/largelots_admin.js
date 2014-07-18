var LargeLotsAdmin = LargeLotsAdmin || {};
var LargeLotsAdmin = {

  map: null,
  map_centroid: [41.8787248907554, -87.7055433591891],
  defaultZoom: 15,
  lastClickedLayer: null,
  geojson: null,
  marker: null,
  locationScope: 'chicago',
  boundingBox: {
    'bottom': 41.868506217235485,
    'top': 41.891607773180716,
    'right': -87.68617630004883,
    'left': -87.7223539352417
  },

  initialize: function() {

      if (!LargeLotsAdmin.map) {
        LargeLotsAdmin.map = L.map('map-admin', {
          center: LargeLotsAdmin.map_centroid,
          zoom: LargeLotsAdmin.defaultZoom,
          scrollWheelZoom: false,
          tapTolerance: 30
        });
      }
      // render a map!
      L.Icon.Default.imagePath = '/static/images/'

      L.tileLayer('https://{s}.tiles.mapbox.com/v3/datamade.hn83a654/{z}/{x}/{y}.png', {
          attribution: '<a href="http://www.mapbox.com/about/maps/" target="_blank">Terms &amp; Feedback</a>'
      }).addTo(LargeLotsAdmin.map);

      LargeLotsAdmin.info = L.control({position: 'bottomright'});

      LargeLotsAdmin.info.onAdd = function (map) {
          this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
          this.update();
          return this._div;
      };

      // method that we will use to update the control based on feature properties passed
      LargeLotsAdmin.info.update = function (props) {
        var date_formatted = '';
        if (props) {
          var info = '';
          if(props.street_number){
              info += "<h4>" + LargeLotsAdmin.formatAddress(props) + "</h4>";
              info += "<p>PIN: " + props.pin14 + "<br />";
          }
          if (props.zoning_classification){
              info += "Zoned: " + props.zoning_classification + "<br />";
          }
          if (props.sq_ft){
              info += "Sq Ft: " + props.sq_ft + "<br />";
          }
          this._div.innerHTML  = info;
        }
      };

      LargeLotsAdmin.info.clear = function(){
          this._div.innerHTML = '';
      }

      LargeLotsAdmin.info.addTo(LargeLotsAdmin.map);

      var fields = "pin14,zoning_classification,ward,street_name,street_dir,street_number,street_type,city_owned,residential"
      var layerOpts = {
          user_name: 'datamade',
          type: 'cartodb',
          cartodb_logo: false,
          sublayers: [
              
              {
                  sql: "select * from egp_parcels where city_owned='T' and residential='T' and alderman_hold != 'T'",
                  cartocss: $('#egp-styles').html().trim(),
                  interactivity: fields
              },
              {
                  sql: "select * from egp_parcels where pin14 in (" + applied_pins + ")",
                  cartocss: $('#egp-styles-applied').html().trim(),
                  interactivity: fields
              },
              {
                  sql: 'select * from east_garfield_park',
                  cartocss: "#east_garfield_park{polygon-fill: #ffffcc;polygon-opacity: 0.2;line-color: #FFF;line-width: 3;line-opacity: 1;}"
              }
          ]
      }
      cartodb.createLayer(LargeLotsAdmin.map, layerOpts)
        .addTo(LargeLotsAdmin.map)
        .done(function(layer) {
            LargeLotsAdmin.lotsLayer = layer.getSubLayer(0);
            LargeLotsAdmin.lotsLayer.setInteraction(true);

            LargeLotsAdmin.lotsLayer.on('featureOver', function(e, latlng, pos, data, subLayerIndex) {
              $('#map-admin div').css('cursor','pointer');
              LargeLotsAdmin.info.update(data);
            });
            LargeLotsAdmin.lotsLayer.on('featureOut', function(e, latlng, pos, data, subLayerIndex) {
              $('#map-admin div').css('cursor','inherit');
              LargeLotsAdmin.info.clear();
            });
            LargeLotsAdmin.lotsLayer.on('featureClick', function(e, pos, latlng, data){
                LargeLotsAdmin.getOneParcel(data['pin14']);
            });
        }).error(function(e) {
        //console.log('ERROR')
        //console.log(e)
      });
  },

  formatAddress: function (prop) {
    if (prop.street_type == null) prop.street_type = "";
    return prop.street_number + " " + prop.street_dir + " " + prop.street_name + " " + prop.street_type;
  },

  getOneParcel: function(pin14){
      if (LargeLotsAdmin.lastClickedLayer){
        LargeLotsAdmin.map.removeLayer(LargeLotsAdmin.lastClickedLayer);
      }
      var sql = new cartodb.SQL({user: 'datamade', format: 'geojson'});
      sql.execute('select * from egp_parcels where pin14 = cast({{pin14}} as text)', {pin14:pin14})
        .done(function(data){
            var shape = data.features[0];
            LargeLotsAdmin.lastClickedLayer = L.geoJson(shape);
            LargeLotsAdmin.lastClickedLayer.addTo(LargeLotsAdmin.map);
            LargeLotsAdmin.lastClickedLayer.setStyle({fillColor:'#f7fcb9', weight: 2, fillOpacity: 1, color: '#000'});
            LargeLotsAdmin.map.setView(LargeLotsAdmin.lastClickedLayer.getBounds().getCenter(), 17);
        }).error(function(e){console.log(e)});
      window.location.hash = 'browse';
  },

  formatPin: function(pin) {
    return pin.replace(/(\d{2})(\d{2})(\d{3})(\d{3})(\d{4})/, '$1-$2-$3-$4-$5');
  },

  //converts a slug or query string in to readable text
  convertToPlainString: function (text) {
    if (text == undefined) return '';
    return decodeURIComponent(text);
  },

  addCommas: function(nStr) {
    nStr += '';
    x = nStr.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
      x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
  }

}

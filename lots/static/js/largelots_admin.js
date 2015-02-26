var LargeLotsAdmin = LargeLotsAdmin || {};
var LargeLotsAdmin = {

  map: null,
  map_centroid: [41.493, -81.681],
  defaultZoom: 12,
  lastClickedLayer: null,
  geojson: null,
  marker: null,
  locationScope: 'cleveland',
  boundingBox: {
    'bottom': 41.386,
    'top': 41.872,
    'right': -81.208,
    'left': -81.968
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

      L.tileLayer('https://{s}.tiles.mapbox.com/v3/cwang912.kdf41n23/{z}/{x}/{y}.png', {
          attribution: '<a href="http://www.mapbox.com/about/maps/" target="_blank">Terms &amp; Feedback</a>'
      }).addTo(LargeLotsAdmin.map);

      LargeLotsAdmin.info = L.control({position: 'bottomright'});

      LargeLotsAdmin.info.onAdd = function (map) {
          this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
          this.update();
          return this._div;
      };

      // method that we will use to update the control based on feature properties passed
      // variables of props determined from cartoDB file
      LargeLotsAdmin.info.update = function (props) {
        var date_formatted = '';
        if (props) {
          var info = '';
          if(props.street_number){
              info += "<h4>" + LargeLotsAdmin.formatAddress(props) + "</h4>";
              info += "<p>PPN: " + props.parcel + "<br />";
          }
          // if (props.zoning_classification){
          //     info += "Zoned: " + props.zoning_classification + "<br />";
          // }
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

      var fields = "ppn,parcel,address,build,ward,spa,sqft,street2,number2" //"pin14,zoning_classification,ward,street_name,street_dir,street_number,street_type,city_owned,residential"
      var layerOpts = {
          user_name: 'opencleveland',
          type: 'cartodb',
          cartodb_logo: false,
          sublayers: [
              {
                  sql: "SELECT * FROM joined WHERE (street2 != '') AND (number2 > 0)",
                  cartocss: $('#egp-styles').html().trim(),
                  interactivity: fields
              }
              // {
              //     sql: 'select * from east_garfield_park',
              //     cartocss: "#east_garfield_park{polygon-fill: #ffffcc;polygon-opacity: 0.2;line-color: #FFF;line-width: 3;line-opacity: 1;}"
              // }
          ]
      }

      var fields = "ppn,parcel,address,build,ward,spa,sqft,street2,number2"
      var layerOpts = {
          user_name: 'opencleveland',
          type: 'cartodb',
          cartodb_logo: false,
          sublayers: [

              {
                  sql: "SELECT * FROM joined WHERE (street2 != '') AND (number2 > 0)",
                  cartocss: $('#egp-styles').html().trim(),
                  interactivity: fields
              },
              {
                  sql: "SELECT * FROM joined WHERE ppn in (" + applied_pins + ")",
                  cartocss: $('#egp-styles-applied').html().trim(),
                  interactivity: fields
              }
              // },
              // {
              //     sql: 'select * from east_garfield_park',
              //     cartocss: "#east_garfield_park{polygon-fill: #ffffcc;polygon-opacity: 0.2;line-color: #FFF;line-width: 3;line-opacity: 1;}"
              // }
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
                LargeLotsAdmin.getOneParcel(data['ppn']);
            });
        }).error(function(e) {
        console.log('ERROR')
        console.log(e)
      });
  },

  formatAddress: function (prop) {
    return prop.number2 + " " + " " + prop.street2;
  },


  getOneParcel: function(ppn_current){
      if (LargeLots.lastClickedLayer){
        LargeLots.map.removeLayer(LargeLots.lastClickedLayer);
      }
      var sql = new cartodb.SQL({user: 'opencleveland', format: 'geojson'});
    //Issue #4: using apostrophes instead of casting to keep leading zeros. - ASKoiman 12/6/2014
      sql.execute('SELECT * from joined WHERE ppn = \'{{num}}\'', {num:ppn_current})
        .done(function(data){
            var shape = data.features[0];
            LargeLots.lastClickedLayer = L.geoJson(shape);
            LargeLots.lastClickedLayer.addTo(LargeLots.map);
            LargeLots.lastClickedLayer.setStyle({fillColor:'#f7fcb9', weight: 2, fillOpacity: 1, color: '#000'});
            LargeLots.map.setView(LargeLots.lastClickedLayer.getBounds().getCenter(), 17);
            LargeLots.selectParcel(shape.properties);
        }).error(function(e){console.log(e)});
      window.location.hash = 'browse';
  },

  // formatPin: function(pin) {
  //   return pin.replace(/(\d{2})(\d{2})(\d{3})(\d{3})(\d{4})/, '$1-$2-$3-$4-$5');
  // },

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

var LargeLots = LargeLots || {};
var LargeLots = {

  map: null,
  map_centroid: [41.77809673652204, -87.63673782348633],
  defaultZoom: 13,
  lastClickedLayer: null,
  geojson: null,
  marker: null,
  locationScope: 'Chicago',
  boundaryCartocss: '#large_lot_boundary{polygon-fill: #ffffcc;polygon-opacity: 0.2;line-color: #FFF;line-width: 3;line-opacity: 1;}',
  parcelsCartocss: $('#englewood-styles').html().trim(),
  boundingBox: {
    'bottom': 41.74378003152462,
    'top': 41.807788914288814,
    'right': -87.57219314575195,
    'left': -87.69750595092773
  },

  initialize: function() {

      if (!LargeLots.map) {
        LargeLots.map = L.map('map', {
          center: LargeLots.map_centroid,
          zoom: LargeLots.defaultZoom,
          scrollWheelZoom: false
        });
      }
      // render a map!
      L.Icon.Default.imagePath = '/images/'

      L.tileLayer('https://{s}.tiles.mapbox.com/v3/datamade.hn83a654/{z}/{x}/{y}.png', {
          attribution: '<a href="http://www.mapbox.com/about/maps/" target="_blank">Terms &amp; Feedback</a>'
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
          //info += "Alderman: " + LargeLots.getAlderman(props.ward) + " (Ward " + props.ward + ")</p>";
          if (props.status == 1){
              info += "Status: <strong>Application received</strong></p>"
          } else {
              info += "Status: <strong>Available</strong></p>"
          }
          this._div.innerHTML  = info;
        }
      };

      LargeLots.info.clear = function(){
          this._div.innerHTML = '';
      }

      LargeLots.info.addTo(LargeLots.map);

      var fields = "pin14,zoning_classification,ward,street_name,dir,street_number,type,sq_ft,status"
      var cartocss = $('#englewood-styles').html().trim();
      var layerOpts = {
          user_name: 'datamade',
          type: 'cartodb',
          cartodb_logo: false,
          sublayers: [{
                  sql: "SELECT * FROM full_area_lots WHERE zoning_classification = 'RT-4A' OR zoning_classification = 'RT-3.5' OR zoning_classification = 'RS-2' OR zoning_classification = 'RS-3' OR zoning_classification = 'RM-6' OR zoning_classification = 'RT-3.5' OR zoning_classification = 'RM-5' OR zoning_classification = 'RT-3.5' OR zoning_classification = 'RT-4'",
                  cartocss: LargeLots.parcelsCartocss,
                  interactivity: fields
              },
              {
                  sql: 'select * from large_lot_boundary',
                  cartocss: LargeLots.boundaryCartocss
              }]
      }
      cartodb.createLayer(LargeLots.map, layerOpts)
        .addTo(LargeLots.map)
        .done(function(layer) {
            var sublayer = layer.getSubLayer(0)
            sublayer.setInteraction(true);
            sublayer.on('featureOver', function(e, latlng, pos, data, subLayerIndex) {
              $('#map div').css('cursor','pointer');
              LargeLots.info.update(data);
            });
            sublayer.on('featureOut', function(e, latlng, pos, data, subLayerIndex) {
              $('#map div').css('cursor','inherit');
              LargeLots.info.clear();
            });
            sublayer.on('featureClick', function(e, pos, latlng, data){
                LargeLots.getOneParcel(data['pin14']);
            });
            window.setTimeout(function(){
                if($.address.parameter('pin')){
                    LargeLots.getOneParcel($.address.parameter('pin'))
                }
            }, 1000)
        }).error(function(e) {
        //console.log('ERROR')
        //console.log(e)
      });
      $("#search_address").val(LargeLots.convertToPlainString($.address.parameter('address')));
      LargeLots.addressSearch();
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

  getOneParcel: function(pin14){
      if (LargeLots.lastClickedLayer){
        LargeLots.map.removeLayer(LargeLots.lastClickedLayer);
      }
      var sql = new cartodb.SQL({user: 'datamade', format: 'geojson'});
      sql.execute('select * from full_area_lots where pin14 = {{pin14}}', {pin14:pin14})
        .done(function(data){
            var shape = data.features[0];
            LargeLots.lastClickedLayer = L.geoJson(shape);
            LargeLots.lastClickedLayer.addTo(LargeLots.map);
            LargeLots.lastClickedLayer.setStyle({fillColor:'#f7fcb9', weight: 2, fillOpacity: 1, color: '#000'});
            LargeLots.map.setView(LargeLots.lastClickedLayer.getBounds().getCenter(), 17);
            LargeLots.selectParcel(shape.properties);
        });
  },

  selectParcel: function (props){
      var address = LargeLots.formatAddress(props);
      var alderman = LargeLots.getAlderman(props.ward);
      var zoning = LargeLots.getZoning(props.zoning_classification);
      var status = 'Available';
      if (props.status == 1){
          status = 'Application Received';
      }
      var info = "<p>Selected lot: </p><img class='img-responsive img-thumbnail' src='http://cookviewer1.cookcountyil.gov/Jsviewer/image_viewer/requestImg.aspx?" + props.pin14 + "=' />\
        <table class='table table-bordered table-condensed'><tbody>\
          <tr><td>Address</td><td>" + address + "</td></tr>\
          <tr><td>PIN</td><td>" + props.pin14 + "</td></tr>\
          <tr><td>&nbsp;</td><td><a target='_blank' href='http://cookcountypropertyinfo.com/Pages/PIN-Results.aspx?PIN=" + props.pin14 + "'>Tax and deed history &raquo;</a></td></tr>\
          <tr><td>Zoned</td><td> Residential (<a href='http://secondcityzoning.org/zone/" + props.zoning_classification + "' target='_blank'>" + props.zoning_classification + "</a>)</td></tr>\
          <tr><td>Sq ft</td><td>" + props.sq_ft + "</td></tr>\
          <tr><td>Status</td><td>" + status + "</td></tr>\
        </tbody></table>";
      $.address.parameter('pin', props.pin14)
      $('#lot-info').html(info);
  },

  getAlderman: function (ward){
      var lookup = {
          20: 'Willie B. Cochran',
          6: 'Roderick T. Sawyer',
          16: 'JoAnn Thompson',
          17: 'Latasha Thomas',
          11: 'James A. Balcer',
          15: 'Toni Foulkes',
          18: 'Lona Lane',
          3: 'Pat Dowell',
          4: 'William Burns',
          5: 'Leslie Hariston',
          8: 'Michelle Harris'
      }
      return lookup[ward]
  },

  getZoning: function(code){
      var zone_type = code.split('-')[0];
      var text = '';
      if (zone_type == 'RS'){
          text = 'Single family home'
      }
      if (zone_type == 'RT'){
          text = 'Two-flat, townhouse'
      }
      if (zone_type == 'RM'){
          text = 'Medium-density apartment'
      }
      return text;
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
      s.src = "http://nominatim.openstreetmap.org/search/" + encodeURIComponent(raw_address) + "?format=json&bounded=1&viewbox=" + LargeLots.boundingBox['left'] + "," + LargeLots.boundingBox['top'] + "," + LargeLots.boundingBox['right'] + "," + LargeLots.boundingBox['bottom'] + "&json_callback=LargeLots.returnAddress";
      document.body.appendChild(s);
      //&bounded=1&viewbox=" + LargeLots.boundingBox['left'] + "," + LargeLots.boundingBox['top'] + "," + LargeLots.boundingBox['right'] + "," + LargeLots.boundingBox['bottom'] + "
    }
  },

  returnAddress: function (response){

    if(!response.length){
      $('#modalGeocode').modal('show');
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

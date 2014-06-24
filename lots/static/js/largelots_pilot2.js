var LargeLots = LargeLots || {};
var LargeLots = {

  map: null,
  map_centroid: [41.8787248907554, -87.7055433591891],
  defaultZoom: 14,
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

      if (!LargeLots.map) {
        LargeLots.map = L.map('map', {
          center: LargeLots.map_centroid,
          zoom: LargeLots.defaultZoom,
          scrollWheelZoom: false
        });
      }
      // render a map!
      L.Icon.Default.imagePath = '/static/images/'

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
          var info = '';
          if(props.street_number){
              info += "<h4>" + LargeLots.formatAddress(props) + "</h4>";
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

      LargeLots.info.clear = function(){
          this._div.innerHTML = '';
      }

      LargeLots.info.addTo(LargeLots.map);

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
                  sql: 'select * from east_garfield_park',
                  cartocss: "#east_garfield_park{polygon-fill: #ffffcc;polygon-opacity: 0.2;line-color: #FFF;line-width: 3;line-opacity: 1;}"
              }
          ]
      }
      cartodb.createLayer(LargeLots.map, layerOpts)
        .addTo(LargeLots.map)
        .done(function(layer) {
            LargeLots.lotsLayer = layer.getSubLayer(0);
            LargeLots.lotsLayer.setInteraction(true);
            LargeLots.lotsLayer.on('featureOver', function(e, latlng, pos, data, subLayerIndex) {
              $('#map div').css('cursor','pointer');
              LargeLots.info.update(data);
            });
            LargeLots.lotsLayer.on('featureOut', function(e, latlng, pos, data, subLayerIndex) {
              $('#map div').css('cursor','inherit');
              LargeLots.info.clear();
            });
            LargeLots.lotsLayer.on('featureClick', function(e, pos, latlng, data){
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
      $('.toggle-parcels').on('click', function(e){
          if($(e.target).is(':checked')){
              $(e.target).prop('checked', true)
          } else {
              $(e.target).prop('checked', false);
          }
          LargeLots.toggleParcels()
      })
  },

  toggleParcels: function(){
      var checks = []
      $.each($('.toggle-parcels'), function(i, box){
          if($(box).is(':checked')){
              checks.push($(box).attr('id'))
          }
      });
      var sql = 'select * from egp_parcels where ';
      var clauses = []
      if(checks.indexOf('applied') >= 0){
          clauses.push('status = 1')
      }
      if(checks.indexOf('available') >= 0){
          clauses.push('status = 0')
      }
      if(clauses.length > 0){
          clauses = clauses.join(' or ');
          sql += clauses;
      } else {
          sql = 'select * from egp_parcels where status not in (0,1)'
      }
      LargeLots.lotsLayer.setSQL(sql);
  },

  formatAddress: function (prop) {
    if (prop.street_type == null) prop.street_type = "";
    return prop.street_number + " " + prop.street_dir + " " + prop.street_name + " " + prop.street_type;
  },

  getOneParcel: function(pin14){
      if (LargeLots.lastClickedLayer){
        LargeLots.map.removeLayer(LargeLots.lastClickedLayer);
      }
      var sql = new cartodb.SQL({user: 'datamade', format: 'geojson'});
      sql.execute('select * from egp_parcels where pin14 = cast({{pin14}} as text)', {pin14:pin14})
        .done(function(data){
            var shape = data.features[0];
            LargeLots.lastClickedLayer = L.geoJson(shape);
            LargeLots.lastClickedLayer.addTo(LargeLots.map);
            LargeLots.lastClickedLayer.setStyle({fillColor:'#f7fcb9', weight: 2, fillOpacity: 1, color: '#000'});
            LargeLots.map.setView(LargeLots.lastClickedLayer.getBounds().getCenter(), 17);
            LargeLots.selectParcel(shape.properties);
        }).error(function(e){console.log(e)});
  },

  selectParcel: function (props){
      var address = LargeLots.formatAddress(props);
      var pin_formatted = LargeLots.formatPin(props.pin14);

      var info = "\
        <table class='table table-bordered table-condensed'><tbody>\
          <tr><td>Address</td><td>" + address + "</td></tr>\
          <tr><td>PIN</td><td>" + pin_formatted + " (<a target='_blank' href='http://cookcountypropertyinfo.com/Pages/PIN-Results.aspx?PIN=" + props.pin14 + "'>info</a>)</td></tr>";
      if (props.zoning_classification){
          info += "<tr><td>Zoned</td><td> Residential (<a href='http://secondcityzoning.org/zone/" + props.zoning_classification + "' target='_blank'>" + props.zoning_classification + "</a>)</td></tr>";
      }
      if (props.sq_ft){
          info += "<tr><td>Sq ft</td><td>" + LargeLots.addCommas(props.sq_ft) + "</td></tr>";

      }
      info += "<tr><td colspan='2'><button type='button' id='lot_apply' data-pin='" + pin_formatted + "' data-address='" + address + "' href='#' class='btn btn-success'>Select this lot</button></td></tr>"
      info += "</tbody></table>\
      <img class='img-responsive img-thumbnail' src='http://cookviewer1.cookcountyil.gov/Jsviewer/image_viewer/requestImg.aspx?" + props.pin14 + "=' />";
      $.address.parameter('pin', props.pin14)
      $('#lot-info').html(info);

      $("#lot_apply").on("click", function(){
        if ($("#id_lot_1_address").val() == "") {
          $("#id_lot_1_address").val($(this).data('address'));
          $("#id_lot_1_pin").val($(this).data('pin'));
        }
        else if ($("#id_lot_1_address").val() != $(this).data('address')){
          $("#id_lot_2_address").val($(this).data('address'));
          $("#id_lot_2_pin").val($(this).data('pin'));
        }

        $(this).html("<i class='fa fa-check'></i> Selected");
        $("#selected_lots").ScrollTo({offsetTop: "70px", 'axis':'y'});
      });
  },

  addressSearch: function (e) {
    if (e) e.preventDefault();
    var searchAddress = $("#search_address").val();
    if (searchAddress != '') {

      var searchAddress = searchAddress.toLowerCase();
      searchAddress = searchAddress.replace(" n ", " north ");
      searchAddress = searchAddress.replace(" s ", " south ");
      searchAddress = searchAddress.replace(" e ", " east ");
      searchAddress = searchAddress.replace(" w ", " west ");

      $("#id_owned_address").val(searchAddress.replace((", " + LargeLots.locationScope), ""));

      if(LargeLots.locationScope && LargeLots.locationScope.length){
        var checkaddress = searchAddress.toLowerCase();
        var checkcity = LargeLots.locationScope.split(",")[0].toLowerCase();
        if(checkaddress.indexOf(checkcity) == -1){
          searchAddress += ", " + LargeLots.locationScope;
        }
      }

      $.address.parameter('address', encodeURIComponent(searchAddress));

      var s = document.createElement("script");
      s.type = "text/javascript";
      s.src = "http://nominatim.openstreetmap.org/search/" + encodeURIComponent(searchAddress) + "?format=json&bounded=1&viewbox=" + LargeLots.boundingBox['left'] + "," + LargeLots.boundingBox['top'] + "," + LargeLots.boundingBox['right'] + "," + LargeLots.boundingBox['bottom'] + "&json_callback=LargeLots.returnAddress";
      document.body.appendChild(s);
      //&bounded=1&viewbox=" + LargeLots.boundingBox['left'] + "," + LargeLots.boundingBox['top'] + "," + LargeLots.boundingBox['right'] + "," + LargeLots.boundingBox['bottom'] + "
    }
  },

  returnAddress: function (response){
    if(!response.length){
      $('#addr_search_modal').html(LargeLots.convertToPlainString($.address.parameter('address')));
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

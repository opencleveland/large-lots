var LargeLots = LargeLots || {};
var LargeLots = {

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

      if (!LargeLots.map) {
        LargeLots.map = L.map('map', {
          center: LargeLots.map_centroid,
          zoom: LargeLots.defaultZoom,
          scrollWheelZoom: false,
          tapTolerance: 30
        });
      }
      // render a map!
      L.Icon.Default.imagePath = '/static/images/'

      L.tileLayer('https://{s}.tiles.mapbox.com/v3/cwang912.kdf41n23/{z}/{x}/{y}.png', {
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
          if(props.number2){
              info += "<h4>" + LargeLots.formatAddress(props) + "</h4>";
              info += "<p>PPN: " + props.parcel + "<br />";
          }
          if (props.build){
              info += "Zoned: " + props.build + "<br />";
          }
          if (props.sqft){
              info += "Sq Ft: " + props.sqft + "<br />";
          }
          this._div.innerHTML  = info;
        }
      };

      LargeLots.info.clear = function(){
          this._div.innerHTML = '';
      }

      LargeLots.info.addTo(LargeLots.map);

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
                console.log(data);
                LargeLots.getOneParcel(data['ppn']);
            });
            window.setTimeout(function(){
                if($.address.parameter('ppn')){
                    LargeLots.getOneParcel($.address.parameter('ppn'))
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
            console.log(ppn_current);
            console.log(data);
            console.log(shape);
            LargeLots.lastClickedLayer = L.geoJson(shape);
            LargeLots.lastClickedLayer.addTo(LargeLots.map);
            LargeLots.lastClickedLayer.setStyle({fillColor:'#f7fcb9', weight: 2, fillOpacity: 1, color: '#000'});
            LargeLots.map.setView(LargeLots.lastClickedLayer.getBounds().getCenter(), 17);
            LargeLots.selectParcel(shape.properties);
        }).error(function(e){console.log(e)});
      window.location.hash = 'browse';
  },

  selectParcel: function (props){
      console.log(props);
      var address = LargeLots.formatAddress(props);

      var info = "<div class='row'><div class='col-xs-6 col-md-12'>\
        <table class='table table-bordered table-condensed'><tbody>\
          <tr><td>Address</td><td>" + address + "</td></tr>\
          <tr><td>PPN</td><td>" + props.parcel + " (<a target='_blank' href='http://treasurer.cuyahogacounty.us/payments/real_prop/ShowTaxBill.asp?txtParcel=" + props.ppn + "'>info</a>)</td></tr>";
      if (props.build){
          info += "<tr><td>Zoned</td><td>" + props.build + "</td></tr>";
      }
      if (props.sqft){
          info += "<tr><td>Square feet</td><td>" + LargeLots.addCommas(props.sqft) + "</td></tr>";
      }
      info += "<tr><td colspan='2'><button type='button' id='lot_apply' data-ppn='" + props.parcel + "' data-address='" + address + "' href='#' class='btn btn-success'>Select this lot</button></td></tr>"
      // info += "</tbody></table></div><div class='col-xs-6 col-md-12'>\
      // <img class='img-responsive img-thumbnail' src='http://cookviewer1.cookcountyil.gov/Jsviewer/image_viewer/requestImg.aspx?" + props.pin14 + "=' /></div></div>";
      $.address.parameter('ppn', props.ppn)
      $('#lot-info').html(info);

      $("#lot_apply").on("click", function(){
        if ($("#id_lot_1_address").val() == "") {
          $("#id_lot_1_address").val($(this).data('address'));
          $("#id_lot_1_pin").val($(this).data('ppn'));
        }
		
        // else if ($("#id_lot_1_address").val() != $(this).data('address')){
        //   $("#id_lot_2_address").val($(this).data('address'));
        //   $("#id_lot_2_pin").val($(this).data('pin'));
        // }

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

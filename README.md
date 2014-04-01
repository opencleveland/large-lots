# Englewood Large Lots

The City of Chicago is selling lots in Englewood for $1 until April 21, 2014. Here's how you get one.

## Running locally

``` bash
git clone git@github.com:datamade/englewood-large-lots.git
cd englewood-large-lots

# to run locally
python -m SimpleHTTPServer
```

navigate to http://localhost:8000/

# Data

Our map was built using open data from Chicago and Cook County:

* [Chicago - City Owned Land Inventory](https://data.cityofchicago.org/Community-Economic-Development/City-Owned-Land-Inventory/aksk-kvfp)
* [Chicago - Wards](https://data.cityofchicago.org/Facilities-Geographic-Boundaries/Boundaries-Wards/bhcv-wqkf)
* [Cook County - 2012 Parcels](https://datacatalog.cookcountyil.gov/GIS-Maps/ccgisdata-Parcel-2012/e62c-6rz8)

# dependencies
We used the following open source tools:

* [QGIS](http://www.qgis.org/en/site/) - graphic information system (GIS) desktop application
* [PostGIS](http://postgis.net/) - geospatial database
* [Bootstrap](http://getbootstrap.com/) - Responsive HTML, CSS and Javascript framework
* [Leaflet](http://leafletjs.com/) - javascript library interactive maps
* [jQuery Address](https://github.com/asual/jquery-address) - javascript library creating RESTful URLs

## Team

* Demond Drummer
* Derek Eder
* Eric van Zanten
* Forest Gregg


## Errors / Bugs

If something is not behaving intuitively, it is a bug, and should be reported.
Report it here: https://github.com/datamade/englewood-large-lots/issues

## Note on Patches/Pull Requests
 
* Fork the project.
* Make your feature addition or bug fix.
* Commit, do not mess with rakefile, version, or history.
* Send me a pull request. Bonus points for topic branches.

## Copyright

Copyright (c) 2014 DataMade and LISC-Chicago. Released under the [MIT License](https://github.com/datamade/englewood-large-lots/blob/master/LICENSE).
### CartoDB Data prep

**Data sources**
* Parcel files – given to us by April Hirsh, in shapefile format
* [List of available land](https://github.com/opencleveland/web-scraping) – scraped by Eamon from [here](http://cd.city.cleveland.oh.us/scripts/cityport.php). Doesn't scrape headers, so thos can either be added manually at the top of the csv file or through a later script.

See the [City Land Bank page](http://www.city.cleveland.oh.us/CityofCleveland/Home/Government/CityAgencies/CommunityDevelopment/LandBank?_piref34_1378101_34_12995_12995.tabstring=Pricing) for more information regarding laws and regulations in Cleveland.

*Transform coordinates from shapefile*

`ogr2ogr` reprojects and converts the shapefile to a GeoJSON format.

```bash
$ ogr2ogr -t_srs EPSG:4326 parcels4326.shp parcelpoly_simple.shp 
$ ogr2ogr -f GeoJSON parcels4326.json parcels4326.shp
```

Convert GeoJSON to CSV using `in2csv` from `csvkit`.

```bash
$ in2csv parcels4326.json > parcels4326.csv
```

Perform an inner join on the the parcel and land bank data, using the Permanent Parcel Number field (PPN), using `csvjoin` from `csvkit`.
```bash
csvjoin -c "ppn,ppn" parcels4326.csv cleveland-land-bank.csv > joined.csv
```
This `joined.csv` file can be uploaded to CartoDB and accessed via API. Future versions of this may store all the parcel data online instead of just the parcels that are available, however this will require more storage space, as that file is ~300 MB and the free CartoDB limit is 50 MB. The `joined.csv` file is about 2 or 3 MB.

* log into NST with username opencleveland@gmail.com. Get the password in the Large-Lots Slack channel
* Click "Cleveland city" to navigate to the data
* Click "Reports" on the menu bar, and then select "Municipal lots w/sqft"
* Click "Download" on the menu bar, and then click "data download".
* The downloaded csv will have a messy name. Rename it to downloaded.csv or something.
* Rename "GIS Area (sq ft)" as "sqft"
* Acquire the parcels.csv -- a csv that contains the parcel boundaries. Carter has a copy, as well as one being on the brigade's Socrata portal. That has it in a shapefile format, conversion is possible with ogr2ogr.
* If both files are in the same folder and you have csvkit installed, run csvjoin -c "column1, column2" downloaded.csv parcels.csv > joined.csv, where column1 and column2 are the indices associated with the the columns that are being joined in the two csvs. It should be "1,3"
* Upload joined.csv into CartoDB -- note that you have to delete the old copy of joined.csv first since the name of the dataset is what is accessed in the javascript files (largelots_cleveland.js or largelots_admin.js). The username for this is also opencleveland@gmail.com and the password is also in the Large-Lots Slack channel


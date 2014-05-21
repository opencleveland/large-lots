VPATH=raw:build
include config.mk
shp=$(notdir $(shell ls raw/cook-county/*.shp))

LAND_HEADER = "pin14,street_number,dir,street_name,type,sq_ft,ward,community_area,zoning_classification,tif_district"

land-inventory.csv:
	@wget https://data.cityofchicago.org/api/views/aksk-kvfp/rows.csv?accessType=DOWNLOAD -qO- | \
		python processors/remove_dashes.py 0 | \
		(echo $(LAND_HEADER) ; tail -n +2) > build/$@

cook-county-parcels.zip:
	@wget "https://datacatalog.cookcountyil.gov/api/geospatial/e62c-6rz8?method=export&format=Shapefile" -O raw/$@

land-inventory.table: large_lot_listing.csv
	@psql -h $(PG_HOST) -U $(PG_USER) -p $(PG_PORT) -d $(PG_DB) -c "DROP TABLE IF EXISTS land_inventory;"
	@csvsql build/large_lot_listing.csv \
			--db "postgresql://$(PG_USER):@$(PG_HOST):$(PG_PORT)/$(PG_DB)" --table land_inventory --insert
	@touch build/land-inventory.table

cook-county-parcels.table: cook-county-parcels.zip
	@mkdir -p raw/cook-county
	@unzip -d raw/cook-county -f $?
	@ogr2ogr -t_srs EPSG:4326 build/$(shp) raw/cook-county/$(shp)
	@shp2pgsql -I -s 4326 -d build/$(shp) cook_county_parcels | \
		psql -d $(PG_DB) -U $(PG_USER) -h $(PG_HOST) -p $(PG_PORT)
	@touch build/cook-county-parcels.table

land-inventory-parcels.shp: cook-county-parcels.table land-inventory.table
	@pgsql2shp -f build/land-inventory-parcels.shp -h $(PG_HOST) -u $(PG_USER) -p $(PG_PORT) $(PG_DB) \
		"SELECT cook_county_parcels.geom, land_inventory.* \
			FROM cook_county_parcels \
			JOIN land_inventory ON cast(cook_county_parcels.PIN14 as bigint) = land_inventory.pin14 \
			WHERE zoning_classification like '%RS-1%' \
			OR zoning_classification like '%RS-2%' \
			OR zoning_classification like '%RS-3%' \
			OR zoning_classification like '%RT-3.5%' \
			OR zoning_classification like '%RT-4%' \
			OR zoning_classification like '%RT-4A%' \
			OR zoning_classification like '%RM-4.5%' \
			OR zoning_classification like '%RM-5%' \
			OR zoning_classification like '%RM-5.5%' \
			OR zoning_classification like '%RM-6%' \
			OR zoning_classification like '%RM-6.5%' \
			OR zoning_classification like '%RT-4%'"

large-lot-boundary.table: large-lot-boundary.shp
	shp2pgsql -I -s 4326 -d raw/large-lot-boundary.shp large_lot_boundary | \
		psql -d $(PG_DB) -U $(PG_USER) -h $(PG_HOST) -p $(PG_PORT)
	@touch build/large-lot-boundary.table

city-owned-residential-lots.table: large-lot-boundary.table
	psql -h $(PG_HOST) -U $(PG_USER) -p $(PG_PORT) -d $(PG_DB) -c "DROP TABLE IF EXISTS city_owned_residential_lots;"
	psql -d $(PG_DB) -U $(PG_USER) -h $(PG_HOST) -p $(PG_PORT) -c \
		"CREATE TABLE city_owned_residential_lots AS \
			SELECT cook_county_parcels.geom, land_inventory.* \
			FROM cook_county_parcels \
			JOIN land_inventory \
			ON cast(cook_county_parcels.PIN14 as bigint) = land_inventory.pin14 \
			WHERE zoning_classification like '%RS-1%' \
			OR zoning_classification like '%RS-2%' \
			OR zoning_classification like '%RS-3%' \
			OR zoning_classification like '%RT-3.5%' \
			OR zoning_classification like '%RT-4%' \
			OR zoning_classification like '%RT-4A%' \
			OR zoning_classification like '%RM-4.5%' \
			OR zoning_classification like '%RM-5%' \
			OR zoning_classification like '%RM-5.5%' \
			OR zoning_classification like '%RM-6%' \
			OR zoning_classification like '%RM-6.5%';"
	@touch build/$@

full-area-lots.table: city-owned-residential-lots.table
	psql -h $(PG_HOST) -U $(PG_USER) -p $(PG_PORT) -d $(PG_DB) -c "DROP TABLE IF EXISTS full_area_lots;"
	@psql -d $(PG_DB) -U $(PG_USER) -h $(PG_HOST) -p $(PG_PORT) -c \
		"CREATE TABLE full_area_lots AS \
			SELECT city_owned_residential_lots.geom, city_owned_residential_lots.pin14, \
			city_owned_residential_lots.street_number, city_owned_residential_lots.street_name, \
			city_owned_residential_lots.dir, city_owned_residential_lots.type, \
			city_owned_residential_lots.sq_ft, city_owned_residential_lots.ward, \
			city_owned_residential_lots.community_area, city_owned_residential_lots.zoning_classification \
		FROM large_lot_boundary \
		JOIN city_owned_residential_lots \
		ON ST_Within(city_owned_residential_lots.geom, large_lot_boundary.geom);"
	@psql -h $(PG_HOST) -U $(PG_USER) -p $(PG_PORT) -d $(PG_DB) -c \
		"ALTER TABLE full_area_lots ADD COLUMN status INTEGER;"
	@psql -h $(PG_HOST) -U $(PG_USER) -p $(PG_PORT) -d $(PG_DB) -c \
		"UPDATE full_area_lots SET status = 0"
	@touch build/$@

APP_HEADER="app_id,app_date,first_name,last_name,organization,req_add1,req_pin1,req_add2,req_pin2"

large-lots-applications.csv: large-lots-applications.xls
	@in2csv raw/$(notdir $?) | \
		python processors/remove_dashes.py 6 | \
		python processors/remove_dashes.py 8 | \
		python processors/remove_x.py 6 | \
		python processors/remove_x.py 8 | \
		python processors/zero_pad.py 6 right 14 | \
		python processors/zero_pad.py 8 right 14 | \
		(echo $(APP_HEADER); tail -n +2) > build/$@

applications.table: large-lots-applications.csv
	@psql -h $(PG_HOST) -U $(PG_USER) -p $(PG_PORT) -d $(PG_DB) -c "DROP TABLE IF EXISTS applications;"
	@csvsql build/large-lots-applications.csv \
		--db "postgresql://$(PG_USER):@$(PG_HOST):$(PG_PORT)/$(PG_DB)" \
		--table applications --insert
	@touch build/applications.table

applied-lots.update: applications.table full-area-lots.table
	@psql -h $(PG_HOST) -U $(PG_USER) -p $(PG_PORT) -d $(PG_DB) -c \
		"UPDATE full_area_lots set status = 1 \
		WHERE pin14 in (SELECT req_pin1 from applications where status != 1) \
		OR pin14 in (SELECT req_pin2 from applications where status != 1)"
	@touch build/applied-lots.update

full_area_lots.shp: applied-lots.update
	@pgsql2shp -f build/full_area_lots.shp -h $(PG_HOST) -u $(PG_USER) -p $(PG_PORT) $(PG_DB) full_area_lots

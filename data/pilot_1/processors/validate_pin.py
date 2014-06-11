import requests
from BeautifulSoup import BeautifulSoup
import psycopg2

url = 'http://cookcountypropertyinfo.com/Pages/PIN-Results.aspx'
bad_pin = 'Information could not be retrieved for the specified PIN.'

def validate(pin):
    if not pin:
        return None
    print 'Looking up %s in cookcountyproperty' % pin
    r = requests.get(url, params={'PIN': pin})
    soup = BeautifulSoup(r.content)
    text = soup.find(attrs={'class': 'search-results-overview'}).text
    if bad_pin in text:
        return 'Bad PIN'
    else:
        return None

def check_db(pin, cursor):
    if not pin:
        return None
    print 'Looking up %s in DB' % pin
    parcel_q = 'select cook_county_parcels.geom \
                from cook_county_parcels join large_lot_boundary on \
                ST_Within(cook_county_parcels.geom, large_lot_boundary.geom) \
                where cook_county_parcels.pin14 = %s'
    land_q = 'select zoning_classification from land_inventory where pin14 = %s'
    cursor.execute(parcel_q, (pin,))
    res = cursor.fetchall()
    if not res:
        return 'PIN not in large lots area'
    else:
        cursor.execute(land_q, (pin,))
        res = cursor.fetchall()
        if not res:
            return 'PIN not in city owned land inventory'
        elif res[0] == 'RS-3':
            return None
        else:
            return 'PIN is Zoned %s' % res[0]

if __name__ == "__main__":
    import sys
    import csv
    fname = sys.argv[1]
    reader = csv.reader(open(fname, 'rb'))
    rows = []
    header = reader.next()
    header.extend(['pin1_status', 'pin2_status'])
    conn = psycopg2.connect('host=33.33.33.8 dbname=lisc user=postgres')
    cursor = conn.cursor()
    for row in reader:
        pin1, pin2 = row[6], row[8]
        pin1_res = validate(pin1)
        pin2_res = validate(pin2)
        if not pin1_res:
            row.append(check_db(pin1, cursor))
        else:
            row.append(pin1_res)
        if not pin2_res:
            row.append(check_db(pin2, cursor))
        else:
            row.append(pin2_res)
        rows.append(row)
    writer = csv.writer(open('bad_pins_outp.csv', 'wb'))
    writer.writerow(header)
    writer.writerows(rows)

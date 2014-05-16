import requests
from BeautifulSoup import BeautifulSoup

url = 'http://cookcountypropertyinfo.com/Pages/PIN-Results.aspx'
bad_pin = 'Information could not be retrieved for the specified PIN.'

def validate(pin):
    r = requests.get(url, params={'PIN': pin})
    soup = BeautifulSoup(r.content)
    text = soup.find(attrs={'class': 'search-results-overview'}).text
    if bad_pin in text:
        print 'Bad PIN'
    else:
        print 'Good PIN'

if __name__ == "__main__":
    import sys
    import csv
    idx = sys.argv[1]
    reader = csv.reader(sys.stdin)
    rows = []
    for row in reader:
        validate(row[int(idx)])

if __name__ == "__main__":
    import sys
    import csv
    idx = sys.argv[1]
    reader = csv.reader(sys.stdin)
    rows = []
    for row in reader:
        row[int(idx)] = row[int(idx)].replace('-', '')
        rows.append(row)
    writer = csv.writer(sys.stdout)
    writer.writerows(rows)

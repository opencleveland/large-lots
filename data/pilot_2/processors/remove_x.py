if __name__ == "__main__":
    import sys
    import csv
    idx = sys.argv[1]
    reader = csv.reader(sys.stdin)
    rows = []
    for row in reader:
        row[int(idx)] = row[int(idx)].replace('X', '0')
        rows.append(row)
    writer = csv.writer(sys.stdout)
    writer.writerows(rows)

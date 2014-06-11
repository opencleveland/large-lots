if __name__ == "__main__":
    import sys
    import csv
    idx = sys.argv[1]
    side = sys.argv[2]
    size = sys.argv[3]
    reader = csv.reader(sys.stdin)
    rows = []
    for row in reader:
        val = row[int(idx)]
        if side == 'left' and val:
            row[int(idx)] = val.zfill(int(size))
        elif side == 'right' and val:
            row[int(idx)] = val.ljust(int(size), '0')
        rows.append(row)
    writer = csv.writer(sys.stdout)
    writer.writerows(rows)

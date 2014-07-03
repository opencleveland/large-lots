if __name__ == "__main__":
    from boto.s3.connection import S3Connection
    from boto.s3.key import Key
    from datetime import datetime
    from lots.local_settings import AWS_SECRET_ACCESS_KEY, AWS_ACCESS_KEY_ID

    conn = S3Connection(AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
    bucket = conn.get_bucket('large-lots-data')
    k = Key(bucket)
    k.key = 'largelots_%s.sqlite' % datetime.now().isoformat()
    k.set_contents_from_filename('db.sqlite3')

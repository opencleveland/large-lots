import psycopg2
import lots_admin.models
import lots_client.models

def submit(CompletedApp):
     conn = psycopg2.connect('host=localhost dbname=ubuntu user=ubuntu')
     cursor = conn.cursor()
     submit_q = 'INSERT INTO LOTS_CLE.Submissions_Test VALUES \
                (%s)'
     cursor.execute(submit_q,(CompletedApp.ppn))
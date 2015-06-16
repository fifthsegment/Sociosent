#!/usr/bin/python

import MySQLdb
import os
import sys

def main(argv):

    print sys.argv[1]

    hostarg = sys.argv[1]
    userarg = sys.argv[2]
    passarg = sys.argv[3]
    dbarg = sys.argv[4]
    portarg = sys.argv[5]
    offsetarg = sys.argv[6]
    countarg = sys.argv[7]
    cmparg = sys.argv[8]
    # Open database connection
    db = MySQLdb.connect(host = hostarg, user = userarg, passwd = passarg, db = dbarg, port = int(portarg))
    #db = MySQLdb.connect(host = '52.6.108.198', user = 'root', passwd = 'letmein1213', db = 'newscraper_db', port = 3306)
    # prepare a cursor object using cursor() method
    cursor = db.cursor()

    # Prepare SQL query to INSERT a record into the database.
    print"query sending 1"
    sql = "SELECT tweet_id,tweet_text FROM tweets WHERE campaign_id ='"+cmparg+"' AND predicted_spam IS NULL" 
    try:
       # Execute the SQL command
       print"executing query"
       cursor.execute(sql)
       
       # Fetch all the rows in a list of lists.
       results = cursor.fetchall()

       #Variable for writing spam/notspam in Database
       status = "none"
       
       #print results
       for row in results :
       	#print row[0], row[1]
            # Open a file
        fo = open("test.txt", "wb")
    	fo.write(row[1]);
    	fo.close()
    	os.system("python bayes.py classify test.txt spam notspam")
    	fo1 = open("result.txt", "r")
    	reslt = fo1.read()
    	fo1.close()
    	#print("read from file")
    	# Execute the SQL command
       	print"executing update query"
       	cursor.execute("UPDATE tweets SET predicted_spam=(%s) WHERE tweet_id=(%s)", (reslt,row[0]))
	db.commit()
	print(reslt)
	#print(row[0])
       #print results[0],results[1],results[2]
       fo.close()
    except:
       print "Error: unable to fecth data"

    # execute SQL query using execute() method.
    #cursor.execute("SELECT VERSION()")

    # Fetch a single row using fetchone() method.
    #data = cursor.fetchone()

    #print "Database version : %s " % data

    # disconnect from server
    db.close()
    print"Job Complete"
if __name__ == "__main__":
    main(sys.argv[1:])


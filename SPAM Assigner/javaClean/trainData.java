import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

// java -cp .:mysql-connector-java-5.0.8.jar trainData
 

public class trainData {

 
 public static void main(String[] args) throws IOException {
 	

System.out.println("All ok");
		String offset= "1001";
	    String  count = "1000";
	    String hostname = "52.0.20.174";
		 String user = "root";
		 String password = "letmein1213";
		 String dbname = "newscraper_db";
		 String port = "3306";

	 if(args.length>0){
		  hostname = args[0];
		  user = args[1];
		  password = args[2];
		  dbname = args[3];
		  port = args[4];
		 offset = args[5];
		 count = args[6];
	 	System.out.println("Arguments received");

	}
	
	    
	    // JDBC driver name and database URL
	    final String JDBC_DRIVER = "com.mysql.jdbc.Driver";  
	    final String DB_URL = "jdbc:mysql://"+hostname+":"+port+"/"+dbname;
	//  Database credentials
	    final String USER = user;
	    final String PASS = password;


	    Connection conn = null;
		   Statement stmt = null;
		   try{
		      //STEP 2: Register JDBC driver
		      Class.forName("com.mysql.jdbc.Driver");

		      //STEP 3: Open a connection
		      System.out.println("Connecting to database...");
		      conn = DriverManager.getConnection(DB_URL,USER,PASS);

		      //STEP 4: Execute a query
		      System.out.println("Creating statement...");
		      stmt = conn.createStatement();
		      String sql;
		      sql = "SELECT tweet_id,tweet_text FROM copy_cleaned_data LIMIT "+offset;
		      ResultSet rs = stmt.executeQuery(sql);
		      //STEP 5: Extract data from result set
		      FileWriter fw = new FileWriter("out.txt");
		     
		      while(rs.next()){
		         //Retrieve by column name
			 	String id  = rs.getString("tweet_id");
		        String text = rs.getString("tweet_text");
				fw.write("d"+id+" "+text+"\n\n");
		       }

		       fw.close();
		       stmt.close();
		       conn.close();
 
		   }catch(SQLException se){
		      //Handle errors for JDBC
		      se.printStackTrace();
		   }catch(Exception e){
		      //Handle errors for Class.forName
		      e.printStackTrace();
		   }finally{
		      //finally block used to close resources
		      try{
		         if(stmt!=null)
		            stmt.close();
		      }catch(SQLException se2){
		      }// nothing we can do
		      try{
		         if(conn!=null)
		            conn.close();
		      }catch(SQLException se){
		         se.printStackTrace();
		      }//end finally try
		   }//end try
		   System.out.println("Goodbye!");
		   
  
  
  
  
  
 }
 

}

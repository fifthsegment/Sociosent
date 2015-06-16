import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;


public class mentions {

 public static void main(String[] args) throws IOException {

System.out.println("All ok");
		String offset= "0";
	    String  count = "10";
	    String hostname = "52.0.20.174";
		 String user = "root";
		 String password = "letmein1213";
		 String dbname = "newscraper_db";
		 String port = "3306";
		String cmp_id = "epldata2";

	 if(args.length>0){
		  hostname = args[0];
		  user = args[1];
		  password = args[2];
		  dbname = args[3];
		  port = args[4];
		 offset = args[5];
		 count = args[6];
		cmp_id = args[7];
	 	System.out.println("Arguments received");

 //Get data from database
	 ///////////////////////////////////////////////////////////////////////
	


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
		      sql = "SELECT tweet_id, ROUND ((LENGTH(tweet_text) - LENGTH( REPLACE ( tweet_text, '@', '') ) ) / LENGTH('@') ) AS count "   
					+"FROM tweets  WHERE campaign_id = '"+cmp_id+"' LIMIT "+offset+","+count;
		      ResultSet rs = stmt.executeQuery(sql);
		      //STEP 5: Extract data from result set
		      while(rs.next()){
		         //Retrieve by column name
			 String id  = rs.getString("tweet_id");
		     String men = rs.getString("count");
			
			
		       //Display values
		         System.out.println("ID: " + id);
		         System.out.println("Count: " + men);

		         int foo = Integer.parseInt(men);
			
				stmt = conn.createStatement();
		        sql = "UPDATE tweets SET mentions ="+foo+" WHERE tweet_id = '"+id+"'";
		          stmt.executeUpdate(sql);

		      }


		      System.out.println("\n");
		       //STEP 6: Clean-up environment
		      rs.close();     
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

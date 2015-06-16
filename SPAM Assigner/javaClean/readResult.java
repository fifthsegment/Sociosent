import java.io.*;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;


public class readResult {
	

	 public static void main(String[] args) throws IOException {
		
		 File dir = new File(".");
		 File fin = new File(dir.getCanonicalPath() + File.separator + "final.pi");
		 	BufferedReader br = new BufferedReader(new FileReader(fin));
	 	String id = "";
	 	String senti = "";
	 	String pos = "";
	 	String neg = "";
	 	String neu = "";
		String line = null;
		


		System.out.println("All ok");

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


			   	while ((line = br.readLine()) != null) {
				System.out.println(line);
				String tokens [] =line.split(" ");
				id = tokens[1].substring(1);
				pos = tokens[2];
				neg = tokens[3];
				neu = tokens[4];

				System.out.println("Tweet ID:\t"+id);

				double po = Double.parseDouble(pos);
				double ne = Double.parseDouble(neg);
				double nu = Double.parseDouble(neu);

				if(po > ne && po > nu){
					System.out.println("Positive:\t"+po);
					senti = "positive";
				}else if(ne > po && ne > nu){
					System.out.println("Negative:\t"+ne);
					senti = "negative";
				}else if(nu > ne && nu > po){
					System.out.println("Neutral:\t"+nu);
					senti = "neutral";
				}
				//update the database with sentiments


		      //STEP 2: Register JDBC driver
		      Class.forName("com.mysql.jdbc.Driver");

		      //STEP 3: Open a connection
		      System.out.println("Connecting to database...");
		      conn = DriverManager.getConnection(DB_URL,USER,PASS);

		      //STEP 4: Execute a query
		      System.out.println("Creating statement...");
		      stmt = conn.createStatement();
		      String sql;
		        sql = "UPDATE training_data " + "SET predicted_sentiment ='"+senti+"' WHERE tweet_id ='"+id+"'";
		          stmt.executeUpdate(sql);
		      }//end while
		      br.close();
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

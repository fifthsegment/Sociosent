import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;


public class cleanup {
public static Set<String> stopWordsSet = new HashSet<String>();


public static  void readStopWords(String filename) throws IOException{
	String sCurrentLine = "";
    FileReader fr=new FileReader(filename);
    BufferedReader br= new BufferedReader(fr);
    while ((sCurrentLine = br.readLine()) != null){
        stopWordsSet.add(sCurrentLine);
        
    }
}

public static String tweetToWords(String tweet){
        String urlPattern = "((https?|ftp|gopher|telnet|file|Unsure|http):((//)|"
                + "(\\\\))+[\\w\\d:#@%/;$()~_?\\+-=\\\\\\.&]*)";
        Pattern p = Pattern.compile(urlPattern, Pattern.CASE_INSENSITIVE);
        Matcher m = p.matcher(tweet);

        int i=0;
        while (m.find()) {
            tweet = tweet.replaceAll(m.group(i),"");
            i++;
        }

        tweet = tweet.replaceAll("@\\w+|#|\\bRT\\b", "");
        tweet = tweet.replaceAll("\n", " ");
        tweet = tweet.replaceAll("[^\\p{L}\\p{N} ]+", "");
        tweet = tweet.replaceAll("[^a-zA-Z]", " ").toLowerCase();
        tweet = tweet.replaceAll(" +", " ").trim();

        return tweet;
    }


    public static String removeStopwords(String tweet){
    	String[] words = tweet.split(" ");
    ArrayList<String> wordsList = new ArrayList<String>();
    
    	
    	try{
    		
    		
            for(String word : words)
            {
                String wordCompare = word.toLowerCase();
                if(!stopWordsSet.contains(wordCompare))
                {
                    wordsList.add(word);
                }
            }
            tweet = "";
            for (String str : wordsList){
                tweet+=str+" ";
            }

       
		    }catch(Exception ex){
		        System.out.println(ex);
		    }
 return tweet;
 }

 
 public static void main(String[] args) throws IOException {
 	

System.out.println("All ok");
		String offset= "0";
	    String  count = "10";
		String cmp_id = "";
	    String hostname = "52.6.108.198";
		 String user = "root";
		 String password = "letmein1213";
		 String dbname = "newscraper_db";
		 String port = "3306";
		String condition = "quit";

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
			System.out.println(conn);
		      stmt = conn.createStatement();
		      String sql;
			System.out.println(cmp_id);
		      sql = "SELECT command FROM campaigns WHERE campaign_id = '"+cmp_id+"'";
		      ResultSet rs = stmt.executeQuery(sql);
		      //STEP 5: Extract data from result set

		      while(rs.next()){
		         //Retrieve by column name
			 	condition  = rs.getString("command");
		}

while(!condition.equals("quit")){




		      //STEP 4: Execute a query
		      System.out.println("Creating statement...");
			System.out.println(conn);
		      stmt = conn.createStatement();
		     
			System.out.println(cmp_id);
		      sql = "SELECT tweet_id,tweet_text FROM tweets WHERE campaign_id = '"+cmp_id+"' AND cleaned_text = ''";
		      rs = stmt.executeQuery(sql);
		      //STEP 5: Extract data from result set
		      System.out.println("Connected...");
		      readStopWords("stopwordslist.txt");
		      System.out.println("Reading file...");
		      while(rs.next()){
		         //Retrieve by column name
			 	String id  = rs.getString("tweet_id");
		        String text = rs.getString("tweet_text");
			
		
		       //Display values
		        System.out.println("ID: " + id);
		        System.out.println("Tweet: " + text);

		        /*

		        text = text.replaceAll("((?:http|https)(?::\\/{2}[\\w]+)(?:[\\/|\\.]?)(?:[^\\s\"]*))", "");;
		        text = text.replaceAll("/(\\s+|^)@\\S+/", " ");

		        text = text.replaceAll("[^a-zA-Z]", " ").toLowerCase();

				*/
				text = tweetToWords(text);
		        //Display values
		        //System.out.println("ID: " + id);
		        //System.out.println("Tweet: " + text+"\n\n");
		        text = removeStopwords(text);
		        System.out.println("Final Tweet Words: "+ text);
		
				stmt = conn.createStatement();
		        sql = "UPDATE tweets " +
		                   "SET cleaned_text ='"+text+"' WHERE tweet_id ='"+id+"'";
		          stmt.executeUpdate(sql);

		          
		       }

//STEP 4: Execute a query
		      System.out.println("Creating statement...");
			System.out.println(conn);
		      stmt = conn.createStatement();
		      
			System.out.println(cmp_id);
		      sql = "SELECT command FROM campaigns WHERE campaign_id = '"+cmp_id+"'";
		      rs = stmt.executeQuery(sql);
		      //STEP 5: Extract data from result set
		      System.out.println("Connected end of while...");
		   
		      while(rs.next()){
		         //Retrieve by column name
			 	condition  = rs.getString("command");
			}

}//end while



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

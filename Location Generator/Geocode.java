import java.io.*;
import java.net.URL;
import java.net.URLConnection;
import java.net.URLEncoder;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.*;
import org.codehaus.jackson.map.ObjectMapper;

public class Geocode {
	/*
	 * Geocode request URL. Here see we are passing "json" it means we will get
	 * the output in JSON format. You can also pass "xml" instead of "json" for
	 * XML output. For XML output URL will be
	 * "http://maps.googleapis.com/maps/api/geocode/xml";
	 */

	private static final String URL = "http://maps.googleapis.com/maps/api/geocode/json";

	/*
	 * Here the fullAddress String is in format like
	 * "address,city,state,zipcode". Here address means "street number + route"
	 * .
	 */
	public GoogleResponse convertToLatLong(String fullAddress) throws IOException {

		/*
		 * Create an java.net.URL object by passing the request URL in
		 * constructor. Here you can see I am converting the fullAddress String
		 * in UTF-8 format. You will get Exception if you don't convert your
		 * address in UTF-8 format. Perhaps google loves UTF-8 format. :) In
		 * parameter we also need to pass "sensor" parameter. sensor (required
		 * from a device with a location sensor. This value must be either true
		 * or false.
		 */

		try {
			Thread.sleep(300); //1000 milliseconds is one second.
		} catch (InterruptedException ex) {
			Thread.currentThread().interrupt();
		}

		URL url = new URL(URL + "?address=" + URLEncoder.encode(fullAddress, "UTF-8") + "&sensor=false");
		// Open the Connection
		URLConnection conn = url.openConnection();

		InputStream in = conn.getInputStream();
		ObjectMapper mapper = new ObjectMapper();
		GoogleResponse response = (GoogleResponse) mapper.readValue( in , GoogleResponse.class); in .close();
		return response;


	}

	public GoogleResponse convertFromLatLong(String latlongString) throws IOException {

		/*
		 * Create an java.net.URL object by passing the request URL in
		 * constructor. Here you can see I am converting the fullAddress String
		 * in UTF-8 format. You will get Exception if you don't convert your
		 * address in UTF-8 format. Perhaps google loves UTF-8 format. :) In
		 * parameter we also need to pass "sensor" parameter. sensor (required
		 * from a device with a location sensor. This value must be either true
		 * or false.
		 */
		URL url = new URL(URL + "?latlng=" + URLEncoder.encode(latlongString, "UTF-8") + "&sensor=false");
		// Open the Connection
		URLConnection conn = url.openConnection();

		InputStream in = conn.getInputStream();
		ObjectMapper mapper = new ObjectMapper();
		GoogleResponse response = (GoogleResponse) mapper.readValue( in , GoogleResponse.class); in .close();
		return response;


	}


	public static void main(String[] args) throws IOException {

		System.out.println("All ok");
		String offset = "0";
		String count = "10";
		String hostname = "52.7.167.156";
		String user = "root";
		String password = "letmein1213";
		String dbname = "newscraper_db";
		String port = "3306";
		String cmp_id = "epldata2";
		String condition = "quit";

		if (args.length > 0) {
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
		final String DB_URL = "jdbc:mysql://" + hostname + ":" + port + "/" + dbname;
		//  Database credentials
		final String USER = user;
		final String PASS = password;


		Connection conn = null;
		Statement stmt = null;
		try {
			String city = "";
			String country = "";
			String city1 = "";
			String country1 = "";
			//STEP 2: Register JDBC driver
			Class.forName("com.mysql.jdbc.Driver");

			//STEP 3: Open a connection
			System.out.println("Connecting to database...");
			conn = DriverManager.getConnection(DB_URL, USER, PASS);


			//STEP 4: Execute a query
			System.out.println("Creating statement...");
			stmt = conn.createStatement();
			String sql;
			sql = "select command FROM campaigns WHERE campaign_id = '" + cmp_id + "'";
			ResultSet rs = stmt.executeQuery(sql);

			//STEP 5: Extract data from result set
			while (rs.next()) {
				//Retrieve by column name
				condition = rs.getString("command");

			}


			while (!condition.equals("quit")) {


				//STEP 4: Execute a query
				System.out.println("Creating statement...");
				stmt = conn.createStatement();
				sql = "select b.user_id, b.location, b.time_zone from tweets a INNER JOIN users b ON a.user_id = b.user_id WHERE a.campaign_id = '" + cmp_id + "' AND a.geo_lat = '' AND a.country_iso ='' ";
				rs = stmt.executeQuery(sql);
				String loc = "";
				//STEP 5: Extract data from result set
				while (rs.next()) {
					//Retrieve by column name
					System.out.println("Running on result set returned...");
					String id = rs.getString("user_id");
					String text = rs.getString("location");
					String zone = rs.getString("time_zone");
					// System.out.println("id = " + id);
					if (text.length() > 0) {
						loc = text;
					} else {
						loc = zone;
					}

					//Display values
					System.out.println("ID: " + id);
					System.out.println("Location: " + text);
					System.out.println("Zone : " + zone);
					String lati = "";
					String longi = "";
					String add = "";

					try {
						System.out.println("Calling Google... with loc = "+loc);
						GoogleResponse res = new Geocode().convertToLatLong(loc);
						System.out.println("Calling Google...");
						System.out.println("Status..."+(String)res.getStatus());
						if (res.getStatus().equals("OK")) {
							System.out.println("Results from Google Returned");
							for (Result result: res.getResults()) {
								lati = result.getGeometry().getLocation().getLat();
								longi = result.getGeometry().getLocation().getLng();

								System.out.println("Lattitude of address is :" + lati);
								System.out.println("Longitude of address is :" + longi);
								ArrayList al1 = (ArrayList) result.getAddress_components();


								if (al1.size() > 1) {
									HashMap < String, String > cache = new HashMap < String, String > ();
									cache = (HashMap) al1.get(al1.size() - 1);
									country = cache.get("short_name");
									// HashMap<String, String> cache1 = new HashMap<String, String>();
									// if(al1.size()>1){
									// 	cache1 = (HashMap) al1.get(al1.size()-2);
									// }else{
									// 	cache1 = (HashMap) al1.get(al1.size()-1);
									// }			
									city = "";

									if (al1.size() > 1) {
										for (int i = 0; i < al1.size() - 1; i++) {
											HashMap < String, String > temp = new HashMap < String, String > ();
											temp = (HashMap) al1.get(i);
											String s = temp.get("short_name");
											if (s.length() == 2) {
												city = s;
												if (country.length()!=2){
													country = s;
												}
											}
										}
									}else{
										for (int i = 0; i < al1.size() - 1; i++) {
											HashMap < String, String > temp = new HashMap < String, String > ();
											temp = (HashMap) al1.get(i);
											String s = temp.get("short_name");
											if (s.length() == 2) {
												country = s;
											}
										}
									}

								}
								System.out.println("City Shortcode is :" + city);
								System.out.println("Country Shortcode is :" + country);
								stmt = conn.createStatement();
								sql = "UPDATE tweets " +
									"SET geo_lat ='" + lati + "', geo_long = '" + longi + "' , city_iso = '" + city + "',country_iso = '" + country + "' WHERE user_id ='" + id + "'";
								stmt.executeUpdate(sql);
							}


						}


						if (res.getStatus().equals("ZERO_RESULTS")) {
							System.out.println("Results from Google EMPTY");
							res = new Geocode().convertToLatLong(zone);
							if (res.getStatus().equals("OK")) {
								for (Result result: res.getResults()) {
									lati = result.getGeometry().getLocation().getLat();
									longi = result.getGeometry().getLocation().getLng();
									System.out.println("Lattitude of address is :" + lati);
									System.out.println("Longitude of address is :" + longi);

									ArrayList al2 = (ArrayList) result.getAddress_components();
									HashMap < String, String > cach = new HashMap < String, String > ();
									cach = (HashMap) al2.get(al2.size() - 1);
									country1 = cach.get("short_name");
									// HashMap<String, String> cach1 = new HashMap<String, String>();
									// if(al2.size()>1){
									// 	cach1 = (HashMap) al2.get(al2.size()-2);
									// }else{
									// 	cach1 = (HashMap) al2.get(al2.size()-1);
									// }			
									city1 = "";

									if (al2.size()> 1){
										for (int i = 0; i < al2.size() - 1; i++) {
											HashMap < String, String > temp1 = new HashMap < String, String > ();
											temp1 = (HashMap) al2.get(i);
											String s1 = temp1.get("short_name");
											if (s1.length() == 2) {
												if (country1.length()!=2){
													country1= s1;
												}
												city1 = s1;
											}
										}
									}else{
										for (int i = 0; i < al2.size() ; i++) {

											HashMap < String, String > temp1 = new HashMap < String, String > ();
											temp1 = (HashMap) al2.get(i);
											String s1 = temp1.get("short_name");
											if (s1.length() == 2) {
												country1 = s1;
											}
										}
									

									}
									
									
									
									System.out.println("City Shortcode is :" + city1);
									System.out.println("Country Shortcode is :" + country1);


									sql = "UPDATE tweets " +
										"SET geo_lat ='" + lati + "', geo_long = '" + longi + "' , city_iso = '" + city1 + "',country_iso = '" + country1 + "' WHERE user_id ='" + id + "'";
									stmt.executeUpdate(sql);
								}

							}
						} //end elseif
					} catch (Exception e) {
						System.out.println("Exception:");
						e.printStackTrace();
					}

					// try{

					// }
					// catch (Exception e){

					// }



					// else
					// {
					//  System.out.println(res.getStatus());
					// }

					System.out.println("\n");

					/////--------------------------------------------/////////		         

				}


				//STEP 4: Execute a query
				System.out.println(" end while of Creating statement...");
				stmt = conn.createStatement();

				sql = "select command FROM campaigns WHERE campaign_id = '" + cmp_id + "'";
				rs = stmt.executeQuery(sql);

				//STEP 5: Extract data from result set
				while (rs.next()) {
					//Retrieve by column name
					condition = rs.getString("command");

				}


			} //end while
			//STEP 6: Clean-up environment
			rs.close();
			stmt.close();
			conn.close();
		} catch (SQLException se) {
			//Handle errors for JDBC
			se.printStackTrace();
		} catch (Exception e) {
			//Handle errors for Class.forName
			e.printStackTrace();
		} finally {
			//finally block used to close resources
			try {
				if (stmt != null) stmt.close();
			} catch (SQLException se2) {} // nothing we can do
			try {
				if (conn != null) conn.close();
			} catch (SQLException se) {
				se.printStackTrace();
			} //end finally try
		} //end try
		System.out.println("Goodbye!");






	}


}
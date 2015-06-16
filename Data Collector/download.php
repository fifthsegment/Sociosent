<?php

$campaign = $_GET["campaign"];
$output = "";
require_once('db/db_lib.php');
	$oDB = new db;
$query = 'SELECT tweet_id, tweet_text, created_at, screen_name, geo_lat, geo_long ' .
    	'FROM tweets WHERE campaign_id = "'.$campaign.'"';
		//$oDB = new db;
  	  $result = $oDB->select($query);
  		while($row = mysqli_fetch_assoc($result)) {
			//print $row['command'];
			$output.= $row["tweet_id"].",".$row["tweet_text"].",".$row["created_at"].",".$row["screen_name"].",".$row["geo_lat"].",".$row["geo_long"]."\n";
		}

// Download the file

$filename = "dataset.csv";
header('Content-type: application/csv');
header('Content-Disposition: attachment; filename='.$filename);

echo $output;
exit;
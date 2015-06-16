
<?php
require_once('db/db_lib.php');
$oDB = new db;
error_reporting(-1);
ini_set('display_errors', 'On');

if (isset($_GET["stop"])){
	//$oDB = new db;
	$c = $_GET["stop"];

	$query = 'SELECT  campaign_id, command ' .
    	'FROM campaigns';
		//$oDB = new db;
  	  $result = $oDB->update("campaigns","command = 'quit'", "campaign_id='".$c."'");
	
	print $oDB->error_msg;
	
	print "Campaign stopped";

	exit();
}

?>


<?php



	  $query = 'SELECT  campaign_id, command ' .
    	'FROM campaigns';
		//$oDB = new db;
  	  $result = $oDB->select($query);
  		while($row = mysqli_fetch_assoc($result)) {
			//print $row['command'];


			print "Campaign ID: ".$row['campaign_id']."<br>";
			$status = "Running";
			if (strcmp($row['command'], 'quit')==0){
				$status = "Stopped";
			}
			print "Campaign Status: ".$status."<br>";
			$querytwo = 'SELECT  count(*) cnt ' .
    	'FROM tweets a where a.campaign_id ="'.$row['campaign_id'].'"';
			$resulttwo = $oDB->select($querytwo);
			
			while($rowtwo = mysqli_fetch_assoc($resulttwo)) {
				print "Tweets collected : ".$rowtwo['cnt']."<br>";
				if ($status == "Running")
				print "Quit Campaign : <a href='?stop=".$row['campaign_id']."'>Stop</a><br>";
				print "<a href='download.php?campaign=".$row['campaign_id']."'>Download your data</a><br>";

			}
			print "<br>";

		}


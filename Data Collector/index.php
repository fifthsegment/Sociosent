<?php
error_reporting(-1);
ini_set('display_errors', 'On');
?>

<?php

if (isset($_GET["newcampaign"])){


?>

<h1>
	Start a New campaign
</h1>
<form action="" method="GET" >
	Campaign Name :<br><em>IMPORTANT: Make sure that there are no spaces in the campaign name</em><br>
	<input type="text" name="campaign_id">
<br><br><br>
	Keywords:<br>
	<em>IMPORTANT: Use new lines to separate keywords. You can enter upto 400 keywords</em><br>
	<pre>
	Example list: 

	Pakistan
	Cricket
	PakvsIndia</pre>
	<textarea name="keywords" rows="14" cols="50"> </textarea><br>
	<input type="hidden" name="step1">
<input type="submit" value="submit">
</form>

<?php
	
	exit();
}


$bpath = "/var/www/html/scraper/db/";

if (isset($_GET["step1"])){
	$campaign_id = $_GET["campaign_id"];
	$keywords = $_GET["keywords"];
	require_once('db/db_lib.php');
	$oDB = new db;
	$field_values = 'campaign_id = "' . $campaign_id . '", ' .
		'command = "start" ' ;
	$oDB->insert('campaigns',$field_values);

	$f = @fopen($bpath."keywords.txt", "r+");
	if ($f !== false) {
		ftruncate($f, 0);
		fclose($f);
	}
	
	$file = $bpath.'keywords.txt';
// Open the file to get existing content
//$current = file_get_contents($file);
// Append a new person to the file
	$contents = $keywords;
	// Write the contents back to the file
	file_put_contents($file, $contents);
	
	print "Campaign created.";
	?>

<a href="?step2&campaign=<?php echo $_GET["campaign_id"]; ?>">Click here to run it</a>

<?php

	exit();

}

if (isset($_GET["step2"])){
	include_once("NiceSSH.class.php");
	$ssh = new NiceSSH();
	$ssh->connect();
	//$cmd = "screen -d -m -S cricket 'cd /var/www/html/scraper/db/ && php get_tweets.php cricket'";
	$cmd = "screen -S campaignrunner";

	//print $ssh->exec("$cmd");
	//print $ssh->exec("cd /var/www/html/scraper/db/");
	//print $ssh->exec("ls");
	$campaign = $_GET["campaign"];
	print $ssh->exec("/var/www/html/scraper/db/runner.sh $campaign &");
	//print $ssh->exec("cd /var/www/html/scraper/db/ && php parse_tweets.php cricket");
	//print $ssh->exec("cd /var/www/html/scraper/db/ && php parse_tweets.php & ");
	$ssh->disconnect();
	print "<pre>";
	
	exit();

	}
?>
<h1>
	Campaigns running on this server
</h1>
<a href="?newcampaign">Click here to start a new Campaign</a><br>
<?php include_once("campaigns.php"); ?>


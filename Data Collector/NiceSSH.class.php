<?php 
class NiceSSH { 
    // SSH Host 
    private $ssh_host = '52.0.20.174'; 
    // SSH Port 
    private $ssh_port = 22; 
    // SSH Server Fingerprint 
    private $ssh_server_fp = '2048 32:f0:0b:50:61:ee:0c:c0:56:f6:9a:ec:fd:52:04:bc'; 
    // SSH Username 
    private $ssh_auth_user = 'ubuntu'; 
    // SSH Public Key File 
    private $ssh_auth_pub = '/var/www/id_rsa.pub'; 
    // SSH Private Key File 
    private $ssh_auth_priv = '/var/www/id_rsa'; 
    // SSH Private Key Passphrase (null == no passphrase) 
    private $ssh_auth_pass; 
    // SSH Connection 
    private $connection; 
    
    public function connect() { 
        if (!($this->connection = ssh2_connect($this->ssh_host, $this->ssh_port))) { 
            throw new Exception('Cannot connect to server'); 
        } 

		//$file = file_get_contents($this->ssh_auth_priv, true);
		//print $file;
		

        $fingerprint = ssh2_fingerprint($this->connection, SSH2_FINGERPRINT_MD5 | SSH2_FINGERPRINT_HEX); 
		//print $fingerprint;
        //if (strcmp($this->ssh_server_fp, $fingerprint) !== 0) { 
        //    throw new Exception('Unable to verify server identity!'); 
        //} 
        if (!ssh2_auth_pubkey_file($this->connection, $this->ssh_auth_user, $this->ssh_auth_pub, $this->ssh_auth_priv, $this->ssh_auth_pass)) { 
            throw new Exception('Autentication rejected by server'); 
        } 
    } 
    public function exec($cmd) { 
        if (!($stream = ssh2_exec($this->connection, $cmd))) { 
            throw new Exception('SSH command failed'); 
        } 
        stream_set_blocking($stream, true); 
        $data = ""; 
		$endNOW = 10;
        while ($buf = fread($stream, 4096) && $endNOW != 1) { 
            $data .= $buf; 
			$endNOW=$endNOW+1;
        } 
        fclose($stream); 
        return $data; 
    } 
    public function disconnect() { 
        $this->exec('echo "EXITING" && exit;'); 
        $this->connection = null; 
    } 
    public function __destruct() { 
        $this->disconnect(); 
    } 
} 
?> 
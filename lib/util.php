<?php
require 'config.php';
$GLOBALS['cfg'] = new Config();

function dbconnect() {
  $cfg = $GLOBALS['cfg'];
  $dsn = 'mysql:dbname=' . $cfg::$db_name . ';host=' . $cfg::$db_host;
  $dbuser = $cfg::$db_user;
  $dbpass = $cfg::$db_pass;

  try {
    return new PDO($dsn, $dbuser, $dbpass);
  } catch(PDOException $e) {
    throw new PDOException($e);
  }
}


function hash_valid($db, $hash) {
  $query = $db->query("SELECT uid FROM hashez WHERE hash='$hash'");
  
  if($query !== FALSE) {
    if(($fetch = $query->fetch(PDO::FETCH_NUM)) !== FALSE) {
      return current($fetch);
    } else {
      // if the cookie was invalid, unset it
      unset_auth_cookie();
      return "invalid";
    }
  } else {
    return "error";
  }
}


function unset_auth_cookie() {
  setcookie("user", '', time()-3600, '/pungent');
}
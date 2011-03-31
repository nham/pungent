<?php
require '../lib/util.php';

try {
  $db = dbconnect();

  $q = "CREATE TABLE userz (
      uid INT AUTO_INCREMENT, 
      mode CHAR(5), 
      uniqid VARCHAR(30), 
      identifier VARCHAR(150),
      notes MEDIUMTEXT,
      PRIMARY KEY (uid))";

  $db->exec($q);


  $q = "CREATE TABLE hashez (
      uid INT,
      hash CHAR(15),
      used INT unsigned)";

  $db->exect($q);

  echo "maybe it worked?";
} catch(PDOException $e) {
  echo "cant do it captain: " . $e->getMessage();
}

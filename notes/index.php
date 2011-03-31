<?php

require '../lib/util.php';

$GLOBALS['db'] = dbconnect();

function update_notes() {
  $db = $GLOBALS['db'];
  $uid = hash_valid($db, $_COOKIE['user']);

  if($uid !== "invalid" && $uid !== "error") {
    $stm = $db->prepare("UPDATE userz SET notes = :notes WHERE uid = :uid");
    $res = $stm->execute(array(':notes' => stripslashes($_POST['notes']), ':uid' => $uid));
   
    if($res !== FALSE)
      echo "success";
    else
      echo "error: update";

  } else {
    echo $uid . ": hash";
  }
}


function retrieve_notes() {
  $db = $GLOBALS['db'];
  $uid = hash_valid($db, $_COOKIE['user']);

  if($uid !== "error" && $uid !== "invalid") {
    $query = $db->query("SELECT notes FROM userz WHERE uid='$uid'");

    if($query !== FALSE)
      echo (($fetch = $query->fetch(PDO::FETCH_NUM)) !== FALSE) ? current($fetch) : "error";
    else
      echo "error: select";

  } else {
    echo $uid;
  }
}


switch($_GET['m']) {
case 'set':
  update_notes();
  break;

case 'get':
  retrieve_notes();
  break;
}
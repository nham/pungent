<?php
require '../lib/util.php';

$GLOBALS['db'] = dbconnect();

function goToApp() {
  header("Location: " . Config::$site_url);
}

function passchunk() {
  return base_convert(mt_rand(0, pow(2, 31) - 1), 10, 36);
}

function gen_hash() {
  $rand1 = passchunk();
  $rand2 = passchunk();
  $hash = $rand1.$rand2;

  if(!hash_unique($hash))
    return gen_hash();
  else
    return $hash;
}

function hash_unique($hash) {
  try {
    $db = $GLOBALS['db'];
    $query = $db->query("SELECT uid FROM hashez WHERE hash='$hash'");
    return $query->fetch() === FALSE;
  } catch(PDOException $e) {
    echo "humbuggery: " . $e;
  }
}

// returns the uid of the user if it exists, or false if it doesnt
function user_exists($mode, $uniqid) {
  try {
    $db = $GLOBALS['db'];
    $stm = $db->prepare("SELECT uid FROM userz WHERE mode = :mode AND uniqid = :uniqid");
    $stm->execute(array(':mode' => $mode, ':uniqid' => $uniqid));
    $fetch = $stm->fetch();
    return ($fetch !== FALSE) ? current($fetch) : FALSE;
  } catch(PDOException $e) {
    echo "humbuggery: " . $e;
  }
}


function create_new_user($mode, $uniqid) {
  try {
    $db = $GLOBALS['db'];
    $stm = $db->prepare("INSERT INTO userz (mode, uniqid) VALUES (:mode, :uniqid)");
    $stm->execute(array(':mode' => $mode, ':uniqid' => $uniqid));
    return $db->lastInsertId();
  } catch(PDOException $e) {
    echo "humbuggery: " . $e;
  }
}

function prune_hashes($uid) {
  try {
    $db = $GLOBALS['db'];
    $limit = time() - 86400*30; // hashes 30 days old are deleted
    $stm = $db->prepare("DELETE FROM hashez WHERE uid = :uid AND used < :limit");
    $stm->execute(array(':uid' => $uid, ':limit' => $limit));
  } catch(PDOException $e) {
    echo "humbuggery: " . $e;
  }
}

function store_hash($uid, $hash) {
  try {
    $db = $GLOBALS['db'];
    $now = time();
    $q = "INSERT INTO hashez (uid, hash, used) VALUES ('$uid', '$hash', '$now')";
    $db->exec($q);
  } catch(PDOException $e) {
    echo "humbuggery: " . $e;
  }
}

function update_ident($uid, $ident) {
  try {
    $db = $GLOBALS['db'];
    $stm = $db->prepare("UPDATE userz SET identifier = :ident WHERE uid = :uid");
    $stm->execute(array(':ident' => $ident, ':uid' => $uid));
  } catch(PDOException $e) {
    echo "humbuggery: " . $e;
  }
}


function auth_routine($mode, $uniqid, $ident) {
  if(($uid = user_exists($mode, $uniqid)) === FALSE) {
    $uid = create_new_user($mode, $uniqid);
  }

  $hash = gen_hash();

  prune_hashes($uid);
  update_ident($uid, $ident);
  store_hash($uid, $hash);

  setcookie("user", $hash, time()+86400*365*5, '/');
  goToApp();
}


function facebook() {
  $app_id = Config::$f_app_id;
  $app_secret = Config::$f_app_secret;
  $myurl = Config::$site_url . "auth/?a=login&m=facebook";

  $code = $_REQUEST['code'];
  
  if(empty($code)) {
    $dialog_url = "http://www.facebook.com/dialog/oauth?client_id="
      . $app_id . "&redirect_uri=" . urlencode($myurl);
   
    echo("<script> top.location.href='" . $dialog_url . "'</script>");
  } else {

    $token_url = "https://graph.facebook.com/oauth/access_token?client_id="
      . $app_id . "&redirect_uri=" . urlencode($myurl) . "&client_secret="
      . $app_secret . "&code=" . $code;

    // Get stuff
    $acctok = file_get_contents($token_url);
    $graph_url = "https://graph.facebook.com/me?" . $acctok;
    $stuff = json_decode(file_get_contents($graph_url));

    $uniqid = $stuff->id;
    $ident = $stuff->name;


    auth_routine('f', $uniqid, $ident);
  }
}



function twitter() {
  require '../lib/tmhOAuth.php';

  $tmhOAuth = new tmhOAuth(array(
    'consumer_key'    => Config::$t_consumer_key,
    'consumer_secret' => Config::$t_consumer_secret,
  ));
 
  $myurl = Config::$site_url . "auth/?a=login&m=twitter";
  session_start();
 
  if(isset($_REQUEST['oauth_verifier'])) {
    $tmhOAuth->config['user_token']  = $_SESSION['oauth']['oauth_token'];
    $tmhOAuth->config['user_secret'] = $_SESSION['oauth']['oauth_token_secret'];

    $tmhOAuth->request('POST', $tmhOAuth->url('oauth/access_token', ''), array(
      'oauth_verifier' => $_REQUEST['oauth_verifier']
    ));

    $resp = $tmhOAuth->extract_params($tmhOAuth->response['response']);
    unset($_SESSION['oauth']);
    setcookie('PHPSESSID', '', time()-3600, '/');

    // Get stuff
    $tmhOAuth->config['user_token']  = $resp['oauth_token'];
    $tmhOAuth->config['user_secret'] = $resp['oauth_token_secret'];
    $tmhOAuth->request('GET', $tmh->url('1/account/verify_credentials'));
    $stuff = json_decode($tmhOAuth->response['response']);

    $uniqid = $stuff->id;
    $ident = $stuff->screen_name;

    auth_routine('t', $uniqid, $ident);

  } else {
    $code = $tmhOAuth->request('POST', $tmhOAuth->url('oauth/request_token', ''), 
array('oauth_callback' => $myurl));

    if($code == 200) {
      $_SESSION['oauth'] = $tmhOAuth->extract_params($tmhOAuth->response['response']);
      $method = isset($_REQUEST['signin']) ? 'authenticate' : 'authorize';
      header("Location: " . $tmhOAuth->url("oauth/{$method}", '')
        . "?oauth_token={$_SESSION['oauth']['oauth_token']}");

    } else {
      // error
      $tmhOAuth->pr(htmlentities($tmhOAuth->response['response']));
    }
  }
}


function google() {
  require '../lib/openid.php';
  try {
    $openid = new LightOpenId;

    if(!$openid->mode) {
      $openid->identity = 'https://www.google.com/accounts/o8/id';
      $openid->required = array('contact/email');
      header('Location: ' . $openid->authUrl());
    } elseif($open->mode === 'cancel') {
      echo "no doin.";
    } else {
      if($openid->validate()) {
        $uniqid = next(explode("?id=", $openid->identity));
        $stuff = $openid->getAttributes();
        $ident = $stuff['contact/email'];
        auth_routine('g', $uniqid, $ident);
      } else {
        // No login done.
      }
    }

  } catch(ErrorException $e) {
    echo $e->getMessage();
  }
}


function logout() {
  $db = $GLOBALS['db'];
  $stm = $db->prepare("DELETE FROM hashez WHERE hash = :hash");
  $stm->execute(array(':hash' => $_COOKIE['user']));
  unset_auth_cookie();
  goToApp();
}


// This handles an AJAX request sent from pungentInit() in pungent.js
function check() {
  $db = $GLOBALS['db'];
  $uid = hash_valid($db, $_COOKIE['user']);
  if($uid !== "error" && $uid !== "invalid") {
    $q = "SELECT identifier FROM userz WHERE uid='$uid'";
    $query = $db->query($q);
    $fetch = $query->fetch();
    echo ($fetch !== FALSE) ? current($fetch) : "error";
  } else {
    echo "invalid";
  }
}


// Main auth control logic
if($_GET['a'] == "login") {
  switch($_GET['m']) {
  case "facebook":
    facebook();
    break;

  case "twitter":
    twitter();
    break;

  case "google":
    google();
    break;

  case "windows":
    break;
  }
} else if($_GET['a'] == "logout") {
  logout();
} else if($_GET['a'] == "check") {
  check();
}
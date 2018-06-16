<?php
  function _menu_select_class($name) {
    if (strpos($_SERVER["PHP_SELF"], $name)!==false) {
      return "class=\"selected\"";
    } else {
      return "";
    }
  }
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>nextrocket.space -  List of upcoming rocket launches to space.</title>
    <link rel="stylesheet" type="text/css" href="css/style.css">
    <link rel="stylesheet" type="text/css" href="css/pikaday.css">
    <link rel="stylesheet" href="lib/fontawesome-4.7.0/css/font-awesome.min.css">
    <link rel="stylesheet" type="text/css" href="https://code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css">

    <link rel="shortcut icon" href="images/favicon-5.ico">

</head>

<body>
<style>
    h1 {
        color:black;


        margin:0;
        padding:0 6px;
    }
    h2 {
        padding:0 6px;


        margin-top:0;
        font-family: 'Open Sans', sans-serif;

        text-transform: uppercase;
    }
    h2 a {
        color:#b40000;
        padding: 6px;

    }
    h2 a:hover, h2 a.selected:hover {
        background-color:black;
        color:white;
    }
    h2 a.selected {
        color:black;
    }
    
</style>
<h2 class="menu" style="float:right; padding-top:0.5em;">
  <!--<a <?=_menu_select_class("index")?> href="index.php">Home</a>-->
  <!--<a <?=_menu_select_class("hardware")?> href="hardware.php">Get the countdown rocket</a>-->
  <a <?=_menu_select_class("about")?> href="about.php">About</a>
  <a href="http://launchlibrary.net">Launchlibrary</a>
</h2>

<h1 style="line-height:1em;">

    <!--
    <img src="images/logo.png" style="height:1em; vertical-align: middle;" alt="LaunchTime">
    -->
    <div class="title">
        <a href="http://nextrocket.space"><span style="color:#b40000;">nextrocket</span>.space</a>
    </div>
    <span style="width:100%; vertical-align: middle; font-size:small;maring:0; padding:0;">
        List of upcoming rocket launches to space
    </span>


</h1>

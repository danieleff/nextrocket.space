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
    <link rel="stylesheet" type="text/css" href="css/jquery-ui.min.css">
    <script id="script" src="script.js"></script>
    <script src="lib/jquery.min.js"></script>
    <script src="lib/jquery-ui.min.js"></script>

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
<script>
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-84608228-1', 'auto');
  ga('send', 'pageview');

</script>

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

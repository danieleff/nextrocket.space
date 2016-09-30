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
    <link rel="stylesheet" type="text/css" href="style.css">
    <script src="script.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.0/jquery.min.js"></script>

</head>

<body>

<script>
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-84608228-1', 'auto');
  ga('send', 'pageview');

</script>

<h1>

    <!--
    <img src="images/logo.png" style="height:1em; vertical-align: middle;" alt="LaunchTime">
    -->
    <span style="color:red;">nextrocket</span>.space

    <span style="vertical-align: middle; font-size:small; padding-top: 1em; padding-left: 2em;">
        List of upcoming rocket launches to space.
        Launch data from <a style="color: #aabab6;" href="http://launchlibrary.net">launchlibrary.net</a>

    </span>
</h1>

<div style="border-top:1px solid black; border-bottom:1px solid black;">
<h2 style="box-shadow: 0 0 15px #444; border-top:1px solid gray; border-bottom:1px solid gray;">
  <a <?=_menu_select_class("index")?> href="index.php">Home</a>
  <!--<a <?=_menu_select_class("hardware")?> href="hardware.php">Get the countdown rocket</a>-->
  <a <?=_menu_select_class("about")?> href="about.php">About</a>
</h2>
</div>

<?php 

session_start();

$userId = $_SESSION["userId"];

$linkUsers = "../database/users.json";
$strUsers = file_get_contents($linkUsers);
$arrUsers = json_decode($strUsers);

$objUser = $arrUsers[1];
$strUser = json_encode($objUser);

echo $strUser;

?>
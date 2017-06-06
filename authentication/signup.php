<?php


	$userEmail = $_GET["email"];
	$userPassword = $_GET["password"];


	$linkUsers = "../database/users.json";
	$strUsers = file_get_contents( $linkUsers );

	$arrUsers = json_decode($strUsers);

	$newUser = json_decode('{}');
	$newUser->userId = uniqid();
	$newUser->email = $userEmail;
	$newUser->password = $userPassword;
	$newUser->availableBalance = 10000;
	$newUser->equityBalance = 10000;
	$newUser->openPositions = [];
	$newUser->closePositions = [];


	array_push($arrUsers, $newUser);
	session_start();
	$_SESSION["userId"] = $newUser->userId;

	$strUsers = json_encode($arrUsers, JSON_PRETTY_PRINT);
	$strNewUser = json_encode($newUser);

	file_put_contents($linkUsers, $strUsers);
	$response = '{
		"status":"success",
		"user":' . $strNewUser . '}';

	echo $response;

?>
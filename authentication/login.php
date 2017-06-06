<?php


$userEmail = $_GET["email"];
$userPassword = $_GET["password"];


$linkUsers = "../database/users.json";
$strUsers = file_get_contents( $linkUsers );

$arrUsers = json_decode($strUsers);
$response = '{"status":"fail"}';
for( $i = 0; $i < count($arrUsers); $i++){

	$objUser = $arrUsers[$i];

	$dbUserEmail = $objUser->email;
	$dbUserPassword = $objUser->password;
	
	if( $dbUserEmail == $userEmail && $dbUserPassword == $userPassword){
		session_start();
		$_SESSION["userId"] = $objUser->userId;
		$_SESSION["objUser"] = $objUser;

		$strUser = json_encode($objUser);

		$response = '{
			"status":"success",
			"user":' . $strUser . '}';
			break;
	}

}

echo $response;



?>
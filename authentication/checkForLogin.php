<?php

session_start();

$response = '{"status":"false"}';
if(isset($_SESSION["userId"])){

	$userId = $_SESSION["userId"];

	$linkUsers = "../database/users.json";
	$strUsers = file_get_contents( $linkUsers );

	$arrUsers = json_decode($strUsers);

	for( $i = 0; $i < count($arrUsers); $i++){

		$objUser = $arrUsers[$i];
		$dbUserId = $objUser->userId;
				
		if( $dbUserId == $userId ){

			$strUser = json_encode($objUser);
			$response = '{
				"status":"true",
				"objUser":' . $strUser . '}';
			break;
		}
	}
}

echo $response;


?>
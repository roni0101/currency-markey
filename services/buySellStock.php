<?php
session_start();
$userId = $_SESSION["userId"];


$positionType = $_GET["positionType"];

$profitCloseStatus = intval( $_GET["profitCloseStatus"] );
$profitCloseMax = intval( $_GET["profitCloseMax"] );
$lossCloseStatus =  intval( $_GET["profitCloseStatus"] );
$lossCloseMax = intval( $_GET["lossCloseMax"] );

$stockId = $_GET["stockId"];
$stockName = $_GET["stockName"];
$stockPrice = floatval( $_GET["stockPrice"] );
$stockQuantity = intval( $_GET["stockQuantity"] );

$stockTotalCost = $stockPrice * $stockQuantity;

$positionId = uniqid();

$dbLink = "../database/users.json";

$strUsers = file_get_contents($dbLink);

$arrUsers = json_decode($strUsers);

foreach ($arrUsers as $objUser) {
	
	if( $objUser->userId == $userId ){


		$objUser->availableBalance -= $stockTotalCost;



		$objNewPosition = json_decode('{}');
		$objNewPosition->positionId = $positionId;
		$objNewPosition->positionType = $positionType;
		$objNewPosition->stockId = $stockId;
		$objNewPosition->stockName = $stockName;
		$objNewPosition->stockPrice = $stockPrice;
		$objNewPosition->stockQuantity = $stockQuantity;
		$objNewPosition->profitCloseStatus = $profitCloseStatus;
		$objNewPosition->profitCloseMax = $profitCloseMax;
		$objNewPosition->lossCloseStatus = $lossCloseStatus;
		$objNewPosition->lossCloseMax = $lossCloseMax;

		array_push($objUser->openPositions, $objNewPosition);

	}

}

$strUsers = json_encode($arrUsers, JSON_PRETTY_PRINT);

file_put_contents($dbLink, $strUsers);

echo '{"positionId":"' . $positionId . '"}';


?>
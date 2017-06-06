<?php 

session_start();
if(isset($_SESSION["userId"])){

	$closePositionId = $_GET["positionId"];
	$currencyPrice = $_GET["currencyPrice"];

	$strDbUsers = file_get_contents("../database/users.json");
	$arrDbUsers = json_decode($strDbUsers);

	for( $i = 0; $i < count($arrDbUsers); $i++ ){
		$objUser = $arrDbUsers[$i];

		if( $objUser->userId == $_SESSION["userId"] ){

			$availableBalance = $objUser->availableBalance;
			$arrClosePositions = $objUser->closePositions;
			$arrOpenPositions = $objUser->openPositions;

			for( $n = 0; $n < count($arrOpenPositions); $n++ ){

				$objPosition = $arrOpenPositions[$n];

				if($closePositionId == $objPosition->positionId){
	
					array_splice($arrOpenPositions, $n, 1);
					array_push($arrClosePositions, $objPosition);

					$positionNewValue = $objPosition->stockQuantity * $currencyPrice;
					$positionOldValue = $objPosition->stockQuantity * $objPosition->stockPrice;


					$positionProfit = $positionNewValue - $positionOldValue;
					$positionValue =  $positionNewValue;

					if( $objPosition->positionType == "SELL"){

						$positionProfit = $positionOldValue - $positionNewValue;
						$positionValue =  $positionProfit + $positionOldValue;
					}
					$availableBalance += $positionValue;
					break;
				}
			}
			$objUser->availableBalance = $availableBalance;
			$objUser->openPositions = $arrOpenPositions;
			$objUser->closePositions = $arrClosePositions;

			$arrDbUsers[$i] = $objUser;
			break;
		}
	}

	$strDbUsers = json_encode($arrDbUsers, JSON_PRETTY_PRINT);

	file_put_contents("../database/users.json", $strDbUsers);
	echo $strDbUsers;


}


?>
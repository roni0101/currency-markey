<?php

function changePrice($oldPrice){	

	$randomChoise = rand(0, 2);
	$randomNumber = rand(1, 10) / 10000;

	$newPrice;

	switch ($randomChoise) {
		case 1:
			$newPrice = $oldPrice + $randomNumber;
			break;

		case 2:
			$newPrice = $oldPrice - $randomNumber;
			break;
		
		default:
			$newPrice = $oldPrice;
			break;
	}

	return $newPrice;
	
}


$dbLink = "../database/currencies.json";
$apiLink = "../database/backup.json";
$strApiData = file_get_contents($apiLink);
$objDBData = json_decode($strApiData);

$arrCurrencies = $objDBData->list->resources;
$length = count($arrCurrencies);
for($i = 0; $i < $length; $i++ ){

	$objCurrency = $arrCurrencies[$i]->resource->fields;

	$objCurrency->price = changePrice($objCurrency->price);

	$arrCurrencies[$i]->resource->fields = $objCurrency;

}

$objDBData->list->resources = $arrCurrencies;

$strDBData = json_encode($objDBData, JSON_PRETTY_PRINT);

file_put_contents($dbLink, $strDBData);

echo $strDBData;


?>
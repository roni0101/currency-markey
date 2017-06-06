
/******************************  MAIN FUNCTIONALITIES  ******************************/


// SWITCH WINDOWS

var allWindows = $(".wdw");
function switchWindow(strWindowName) {
	var  windowToShow = "#wdw-" + strWindowName;
	allWindows.hide();
	$(windowToShow).show();
}


/*
	Function used to 
	show and hide error message for forms
*/
function showErrorMessage(elmErrorMessage, strError) {

  elmErrorMessage.text(strError);
  elmErrorMessage.css("opacity", 1);

  setTimeout(function () {
  	elmErrorMessage.css("opacity", 0);
  }, 3000);
}



/*
shows foreground and 
the correct element in it.
Ex. sign in and sign up forms and loader 
*/
function changeForeground(strElementName, strAction) {

	var foregroundElements = $(".fg-item");
	foregroundElements.hide();

	var html = $("html");
	var elmForeground = $("#foreground-container");

	if(strAction == "show"){
		var strElement = "#fg-" + strElementName;
		var element = $(strElement);
		html.css("overflow-y", "hidden");
		element.show();
		elmForeground.show();		
	}else{
		html.css("overflow-y", "auto");
		elmForeground.hide();
	}

}

function convertToCurrency (numPrice) {

	var argumentType = typeof numPrice;

	if(argumentType != "number"){
		numPrice = Number(numPrice);
	}
	var currency = '$';
	var finalNumber = numPrice.toFixed(2);
	var isMinusBefore = false;

	finalNumber = finalNumber.replace(/./g, function(c, i, a) {
		if(finalNumber < 0 && i > 0){

			if(a[i-1] == "-"){
				isMinusBefore = true;
			}else{
				isMinusBefore = false;
			}
		}
        return i > 0 && c !== "." && !isMinusBefore && (a.length - i) % 3 === 0 ? "," + c : c;
    });

  return currency + " " + finalNumber;
}

function convertToNumber (strPrice) {
	strPrice = strPrice.replace(/,/g , "");
	strPrice = strPrice.replace("$ ", "");
	var numPrice = Number(strPrice);
	return numPrice;
}






/******************************  USER FRAMEWORK  ******************************/

// GET USER DATA
var objUser;

function getUserData() {
	var urlGetUserData = "authentication/getUserData.php";
	$.getJSON(urlGetUserData, function (objData) {
		objUser = objData;
	});
}

function displayUserData(availableBalance, equityBalance, profit) {
		

	$("#available-balance").text( convertToCurrency( availableBalance ) );
	$("#equity-balance").text( convertToCurrency( equityBalance ) );
	$("#profit-loss").text(convertToCurrency( profit ) );

}


function displayUserNav() {
		var btnLogin = $(".btn-sign-in");
		btnLogin.removeClass("btn-sign-in");
		btnLogin.addClass("btn-sign-out");
		btnLogin.text("Log out");
}

function logOut() {

	var linkLogout = "authentication/logout.php";
	$.get(linkLogout, function(){

		clearInterval(tickerId);
		$("#info-bar").hide();
		$(".currency-list").empty();
		$("#chart").empty();
		$("#chart-container").hide();
	
		var btnLogout = $(".btn-sign-out");
		btnLogout.text("Sign in");
		btnLogout.removeClass("btn-sign-out");
		btnLogout.addClass("btn-sign-in");

		switchWindow("home");

	});
}

// CLOSE OPEN POSITION
function closePosition(element) {
	var currencyContainer = $(element).parents(".currency-item").find(".currency-info");
	var positionContainer = $(element).parents(".open-position");
	var positionId = $(element).attr("data-position-id");

	var currencyPrice = currencyContainer.find(".currency-buy-price").text();
	currencyPrice = Number(currencyPrice);
	currencyPrice = currencyPrice - 0.0004;
	currencyPrice = Number( currencyPrice.toFixed(4) );

	$.ajax({
		method:"GET",
		url:"services/closePosition.php",
		dataType:"JSON",
		data:{
			positionId: positionId,
			currencyPrice:currencyPrice
		}
	}).done(function (argument) {

		positionContainer.remove();
		getUserData();
	});
}






/******************************  CURRENCY FRAMEWORK  ******************************/
var arrCurrencies;

function getCurrencies(fun) {
	if(!fun){
		fun = function () {}
	}
	$.getJSON("services/getCurrencies.php", function (objData) {
			arrCurrencies = objData.list.resources;
			fun();
	});
}

function getPositionProfitAndValue(objCurrency, objPosition) {

	var positionProfit = 0;
	var positionValue = 0;

	var positionType = objPosition.positionType;
	var positionQuantity = objPosition.stockQuantity;
	var positionCurrencyPrice = objPosition.stockPrice;

	var currencyPrice = objCurrency.price;
	var currentPositionValue = currencyPrice * positionQuantity;
	var oldPositionValue =  positionCurrencyPrice * positionQuantity;

	if(positionType == "BUY"){

		positionProfit = currentPositionValue - oldPositionValue;
		positionValue = currentPositionValue;
	}else{
		positionProfit = oldPositionValue - currentPositionValue;
		positionValue =  positionProfit + oldPositionValue;
	}


	var objProfitAndValue = {};
	objProfitAndValue.profit = positionProfit;
	objProfitAndValue.value = positionValue;

	return objProfitAndValue;

}


var openPositionTemplate = '<div class="open-position">\
								<div class="position-info">\
									<span class="describe-text">Position</span><span class="open-position-type">{{POSITION_TYPE}}</span>\
									<span class="describe-text">Value</span><span class="open-position-value">{{CURRENCY_PRICE}}</span>\
								</div>\
								<div class="position-info">\
									<span class="describe-text">Profit/Loss</span><span class="open-position-profit">{{POSITION_PROFIT}}</span>\
									<button class="btn-custom close-position" data-position-id="{{POSITION_ID}}">Close</button>\
								</div>\
							</div>';



var stockTemplate ='<div class="currency-item  main-element" id="{{IS_ACTIVE}}">\
					<div class="currency-info">\
						<div class="caption">\
							<span class="currency-name">{{STOCK_NAME}}</span>\
						</div>\
						<div class="currency-actions" data-currency-id="{{STOCK_ID}}">\
								<div class="currency-action">\
									<span class="currency-buy-price {{TEXT_COLOR}}">{{STOCK_BUY_PRICE}}</span>\
									<button class="btn-custom btn-action">BUY</button>\
								</div>\
								<div class="currency-action">\
									<span class="currency-sell-price {{TEXT_COLOR}}">{{STOCK_SELL_PRICE}}</span>\
									<button class="btn-custom btn-action">SELL</button>\
								</div>\
						</div>\
					</div>\
					<div class="open-positions"></div>\
				</div>';

function displayStock(stockName, elementId, textColor, stockId, stockBuyPrice, stockSellPrice) {
	var stockLayout = stockTemplate.replace("{{STOCK_NAME}}", stockName);
	stockLayout = stockLayout.replace("{{IS_ACTIVE}}", elementId);
	stockLayout = stockLayout.replace("{{TEXT_COLOR}}", textColor);
	stockLayout = stockLayout.replace("{{TEXT_COLOR}}", textColor);
	stockLayout = stockLayout.replace("{{STOCK_ID}}", stockId);
	stockLayout = stockLayout.replace("{{STOCK_BUY_PRICE}}", stockBuyPrice);
	stockLayout = stockLayout.replace("{{STOCK_SELL_PRICE}}", stockSellPrice);
	$(".currency-list").append(stockLayout);	
}					

function updateStock (corectElement, textColor, currencyBuyPrice, currencySellPrice) {
	var elementBuyClass = "currency-buy-price " + textColor;
	var elementSellClass = "currency-sell-price " + textColor;
	$(".currency-buy-price" + corectElement).text(currencyBuyPrice).attr("class", elementBuyClass);
	$(".currency-sell-price" + corectElement).text(currencySellPrice).attr("class", elementSellClass);
}

var arrFakePoints = [];

/*
	Displays all:
	- Currencies
	- User open positions
	- Dots on chart and chart

*/

function displayCurrencies() {

	var userTotalProfit = 0;
	var allPositionsValue = 0;
	
	for(var i = 0, length = 20; i < length; i++){

		var objCurrency = arrCurrencies[i].resource.fields;
		var currencyId = objCurrency.id;
		var currencyName = objCurrency.name;
		var currencyPrice = objCurrency.price;
		var textColor = "secondary-text";

		if(localStorage.currencies){
			var strCurrenciesLS = localStorage.currencies;
			var arrCurrenciesLS = JSON.parse(strCurrenciesLS);
			var currencyPriceLS = arrCurrenciesLS[i].resource.fields.price;	

			if( currencyPrice > currencyPriceLS){
				textColor = "green-text";
			}
			else if( currencyPrice < currencyPriceLS ){
				textColor = "red-text";
			}else{
				textColor = "secondary-text";
			}
		}
		var currencyBuyPrice = currencyPrice + 0.0004;
		currencyBuyPrice = currencyBuyPrice.toFixed(4);
		currencyBuyPrice = Number(currencyBuyPrice);

		var currencySellPrice = currencyPrice - 0.0004;
		currencySellPrice = currencySellPrice.toFixed(4);
		currencySellPrice = Number(currencySellPrice);

		var elmId = "";
		if( i == 10){
			elmId = "active-item"
		}

		displayStock(
			currencyName,
		  elmId, textColor, currencyId,
		  currencyBuyPrice, currencySellPrice
		 );


		var correctElement = ":eq(" + i + ")";
		var elmCurrency = $(".currency-item" + correctElement);
		var elmPosition = elmCurrency.find(".open-positions");

		//generate fake points for chart for current currency
		var arrPoints = generateFakePoints(currencyPrice);
		var objFakePoits = {
			currencyId: currencyId,
			arrPoints: arrPoints
		};
		arrFakePoints.push(objFakePoits);


		//get user open position
		var userOpenPositions = objUser.openPositions;
		var positionsCount = userOpenPositions.length;

		for(var c = 0; c < positionsCount; c++){
			var objPosition = userOpenPositions[c],
			positionId = objPosition.positionId,
			positionCurrencyId = objPosition.stockId,
			positionType = objPosition.positionType,
		  positionQuantity = objPosition.stockQuantity,
			positionCurrencyPrice = objPosition.stockPrice;


			/*
				get user profit/loos from position
				and position value = quentity * price
			*/

			if(positionCurrencyId == currencyId){
	
				var positionProfitAndValue = getPositionProfitAndValue(objCurrency, objPosition);

				var positionProfit = positionProfitAndValue.profit;
				userTotalProfit += positionProfit;

				var positionValue = positionProfitAndValue.value;
				allPositionsValue += positionValue;


				//Display user open position in currency list

				var openPositionLayout = openPositionTemplate.replace("{{POSITION_TYPE}}", positionType);
				openPositionLayout = openPositionLayout.replace("{{POSITION_ID}}", positionId);
				openPositionLayout = openPositionLayout.replace("{{CURRENCY_PRICE}}", positionCurrencyPrice);
				openPositionLayout = openPositionLayout.replace("{{POSITION_PROFIT}}", convertToCurrency(positionProfit) );

				elmPosition.append(openPositionLayout);	
			}
		}
	}
	displayChart();
	var objFirstCurrency = arrCurrencies[0].resource.fields;
	var chartMax = objFirstCurrency.price + 0.005;
	var chartMin = objFirstCurrency.price - 0.005;
	var chartName = objFirstCurrency.name;
	chart.options.axisY2.maximum = chartMax;
	chart.options.axisY2.minimum = chartMin;
	chart.options.title.text = chartName;
	chart.options.data[0].dataPoints = arrFakePoints[0].arrPoints;
	chart.render();

	var userEquity = allPositionsValue + objUser.availableBalance;

	displayUserData(objUser.availableBalance, userEquity, userTotalProfit);
	$("#info-bar").css("display", "flex");
	displayUserNav();

	switchWindow("market");
	$("#sign-in-loader").hide();
	$("#fg-sign-in").find(".row").show();
	changeForeground("loader", "hide");

	var strCurrencies = JSON.stringify(arrCurrencies);
	localStorage.currencies = strCurrencies;

	startTicker();
}


/******************************  ACTION WINDOW   ******************************/

var objActionWindow = {
	display:function (element) {

		var useElement = $(element);
		var stockId = useElement.parents(".currency-actions").attr("data-currency-id");
		var stockName = useElement.parents(".currency-info").find(".currency-name").text();
		
		var positionType = useElement.text();
		
		var elementStockPrice = ".currency-buy-price";
		if(positionType == "SELL"){
			elementStockPrice = ".currency-sell-price";
		}

		var stockPrice = useElement.parent().find(elementStockPrice).text();
		stockPrice = Number(stockPrice);

		$("#action-error").hide();	

		var totalToPay = stockPrice * 1000;

		$("#action-position-type").text(positionType);
		$("#action-submit-action").attr("data-stock-id", stockId).text(positionType);
		$("#action-stock-name").text(stockName);
		$("#action-stock-price").text(stockPrice);
		$("#action-total-to-pay").text( convertToCurrency(totalToPay) );

		if( $("#action-wdw").is(":hidden") ){
			$("#action-wdw").toggle("slide", {direction: 'right'}, 400);	
		}
	},
	close:function () {
		$("#action-wdw").toggle("slide", {direction: "right"}, 400);	
	},
	updateTotal:function () {
		var elementAmoutInput = $("#action-stock-quantity");
		var numQuantity = elementAmoutInput.val();
		numQuantity = Number(numQuantity);

		// var numQuantity = this.validateIntInput(elementAmoutInput, strQuantity);

		var elementInfoContainer = $(elementAmoutInput).parents("#action-info");
		var numStockPrice = elementInfoContainer.find("#action-stock-price").text();
		numStockPrice = Number(numStockPrice);
		var numTotalToPay = numStockPrice * numQuantity;
		var elementTotalToPay = elementInfoContainer.find("#action-total-to-pay");
		elementTotalToPay.text( convertToCurrency( numTotalToPay ) );			
	}
}




/******************************  CHART FUNCTIONS ******************************/
var chart;
function displayChart () {

	chart = new CanvasJS.Chart("chart", { 
		backgroundColor: "rgba(0,0,0,0.1)",
		theme: "theme5",
		color:"white",
		zoomEnabled: true, 
		title: {
			fontColor:"white"
		},
		toolTip: {
			backgroundColor:"#263238",
			fontColor:"white"
		},
		axisY2: {
			Title:"Works",
			interval:0.002,
			maximum:0.0100,
			minimum:0,
	        labelFontColor: "white"
		},
		axisX:{
	        labelFontColor: "white",
	        interval:30
		},
		data: [
			{
				axisYType: "secondary",
				type: "spline",
				color:"white",
				backgroundColor:"white",
				fontColor:"white",
				dataPoints: []
			}
		]
	});
	chart.render();		
	$("#chart-container").show();	
}

function updateChart(corectElement, stockId, stockPrice, stockName, intIndex) {

		var elementStockItem = $(".currency-item" + corectElement);
		var strItemStockId = elementStockItem.find(".currency-actions").attr("data-currency-id");

		if( strItemStockId == stockId && elementStockItem.attr("id") == "active-item"){

 			// var arrPoints = chart.options.data[0].dataPoints;
 			var arrPoints = arrFakePoints[intIndex].arrPoints;
			var intPointsLastIndex = arrPoints.length - 1;
			var nextPointX = 0;

			var currentDate = new Date();
   		var hours = currentDate.getHours();
  		var minutes = currentDate.getMinutes();
  		var seconds = currentDate.getSeconds();

  		if(seconds < 10){
  			seconds = "0" + seconds;
  		}
  		 if(minutes < 10){
  			minutes = "0" + minutes;
  		}
  		 if(hours < 10){
  			hours = "0" + hours;
  		}
			var nextPointLabel = hours + ":"  + minutes + ":" + seconds;
			
			var lastItemX = arrPoints[intPointsLastIndex].x;
			var lastItemTime = arrPoints[intPointsLastIndex].label;

			nextPointX = lastItemX + 2;

			var myNewObj = {
				x:nextPointX,
				y:stockPrice,
				label:nextPointLabel
			};

			var chartMax = stockPrice + 0.005;
			var chartMin = stockPrice - 0.005;

			chart.options.axisY2.maximum = chartMax;
			chart.options.axisY2.minimum = chartMin;
			chart.options.title.text = stockName;


			if( arrPoints.length > 130){
				arrPoints.splice(0, 1);
			}
			arrFakePoints[intIndex].arrPoints.push(myNewObj);
			chart.options.data[0].dataPoints = arrFakePoints[intIndex].arrPoints;
			chart.render();
		}		
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function generateFakePrice(numPrice){	

	var randomChoise = getRandomInt(0, 3);
	var randomNumber = getRandomInt(1, 11) / 10000;

	var newPrice;

	switch (randomChoise) {
		case 1:
			newPrice = numPrice + randomNumber;
			break;

		case 2:
			newPrice = numPrice - randomNumber;
			break;
		
		default:
			newPrice = numPrice;
			break;
	}

	return newPrice;
	
}

function generateFakePoints(price){
	var currentDate = new Date();
	var hours = currentDate.getHours();

	var minutes = currentDate.getMinutes();
	var seconds = currentDate.getSeconds();

	var allSeconds = (hours * 3600) + (minutes * 60) + seconds;

	var arrPoints = [];
	var i = 130;

	while(i--){

		// Fake the time - backwards 
		var pointInSeconds = allSeconds - i;
		var secondsLeft = pointInSeconds % 60;
		var minutesLeft = ( (pointInSeconds - secondsLeft) / 60 ) % 60;
		var hoursLeft = pointInSeconds - ( secondsLeft + (minutesLeft * 60) );
		hoursLeft = hoursLeft / 3600; 

		if(secondsLeft <= 9){
			secondsLeft = "0" + secondsLeft
		}
		if(minutesLeft <= 9){
			minutesLeft = "0" + minutesLeft
		}
		if(hoursLeft <= 9){
			hoursLeft = "0" + hoursLeft
		}
		var pointTime = hoursLeft + ":" + minutesLeft + ":" + secondsLeft;

		// Fake the currency price
		var currencyPrice =  generateFakePrice(price);
		currencyPrice = currencyPrice.toFixed(4);
		currencyPrice = Number(currencyPrice);

		var nextPointX = 20 - i;
		nextPointX *= 2;
		var myNewObj = {
			x:nextPointX,
			y:currencyPrice,
			label: pointTime
		}

		arrPoints.push(myNewObj);
	}

	return arrPoints;

}





/******************************  NOTIFICATIONS  ******************************/


var audio = new Audio('sounds/notify.wav');



function spawnNotification(strTitle, currencyName, profit) {
	var strBody = "Name " + currencyName + "\n" + "Profit " + convertToCurrency(profit);
	var options = {
		body: strBody,
    icon: "images/currency-icon.png"
	}
	var n = new Notification(strTitle,options);	
	audio.play();	
}

Notification.requestPermission();










/******************************  EVENT LISTENERS  ******************************/


/**************  USER  ***************/

// Open sign up form
$(document).on("click", ".btn-sign-up", function () {
	changeForeground("sign-up", "show");
});

//Cancel login
$(document).on("click", ".btn-cancel-sign-up", function () {
	changeForeground("sign-up", "hide");
});

//Submit sign up form
$(document).on("click", "#btn-sign-up-submit", function () {

	var elmEmail = $("#inp-sign-up-email")
	var strEmail = elmEmail.val();
	var elmPassword = $("#inp-sign-up-password");
	var strPassword = elmPassword.val();

	var urlSignup = "authentication/signup.php";
	$.ajax({
		methd:"POST",
		url:urlSignup,
		dataType:"JSON",
		data:{
			"email":strEmail,
			"password": strPassword
		}
	}).done(function (objData) {
		elmEmail.val("");
		elmPassword.val("");
		objUser = objData.user;
		getCurrencies(displayCurrencies);
	});
});

// Open sign in form
$(document).on("click", ".btn-sign-in", function () {
	changeForeground("sign-in", "show");
});
// Cancel login
$(document).on("click", ".btn-cancel-sign-in", function () {
	changeForeground("sign-in", "hide");
});

//Submit sign in form
$(document).on("click", "#btn-sign-in-submit", function () {
	var btnSubmit = $(this),
	btnContainer = btnSubmit.parent(),
	elmLoader = $("#fg-sign-in .loader-small");

	var elmEmail = $("#inp-sign-in-email"),
	elmPassword = $("#inp-sign-in-password"),
	strEmail = elmEmail.val(),
	strPassword = elmPassword.val();

	var elmErrorMessage =	$("#fg-sign-in").find(".form-error");

	if(strEmail != "" && strPassword != ""){
		
		var strLink = "authentication/login.php";

		$.ajax({
			url:strLink,
			method:"GET",
			dataType:"JSON",
			data:{
				"email":strEmail,
				"password":strPassword
			}
		}).done(function (objData) {

			var response = objData.status;
			if(response == "fail"){

				showErrorMessage(elmErrorMessage, "Wrong email or password");
				elmLoader.hide();
				btnContainer.show();
			}else{
				btnContainer.hide();
				elmLoader.show();
				elmEmail.val("");
				elmPassword.val("");
				objUser = objData.user;
				getCurrencies(displayCurrencies);
				// changeForeground("sign-in", "hide");
			}
		});
	}else{
		elmLoader.hide();
		btnContainer.show();
		showErrorMessage(elmErrorMessage, "All fields are required");
	}
});

//Log out
$(document).on("click", ".btn-sign-out", logOut);


$(document).on("click", ".close-position", function () {
	closePosition(this);
});




/**************  ACTION WINDOW - BUY/SELL  ***************/

// ACTION WINDOW - close position on profit/loss
$(document).on("change", ".action-close-confirm", function () {
	var elementProfitContainer = $(this).parent().find(".action-close-container");
	if( $(this).is(":checked") ){
		elementProfitContainer.show();
	}else{
		elementProfitContainer.hide();
	}
});

// ACTION WINDOW - SHOW
$(document).on("click", ".btn-action", function(){
	objActionWindow.display(this);
});

// ACTION WINDOW - HIDE
$(document).on("click", "#action-cancel-action", objActionWindow.close);

// ACTION WINDOW - SUBMIT BUY/SELL CURRENCY - OPEN POSITION
$(document).on("click", "#action-submit-action", function(){


	var positionType = $(this).text();
	var stockPrice = $("#action-stock-price").text();
	stockPrice = Number( stockPrice );

	var elementProfitClose = $("#close-on-profit");
	var elementLossClose = $("#close-on-loss");

	var	profitCloseMax = 0
	var profitCloseStatus = 0;
	if(elementProfitClose.is(":checked")){
		profitCloseStatus = 1;
		profitCloseMax  = $(elementProfitClose).parent().find(".close-position-max").val();
	}

	var	lossCloseMax = 0;
	var lossCloseStatus = 0;
	if(elementLossClose.is(":checked")){
		lossCloseStatus = 1;
		lossCloseMax  = $(elementLossClose).parent().find(".close-position-max").val();
	}

	var stockId = $("#action-submit-action").attr("data-stock-id");
	var stockName = $("#action-stock-name").text();
	var stockQuantity = $("#action-stock-quantity").val();
	stockQuantity = Number( stockQuantity );

	var userAvailableBalance = $("#available-balance").text();
	userAvailableBalance = convertToNumber( userAvailableBalance );

	var requiredBalance = stockPrice * stockQuantity;
	if( requiredBalance > userAvailableBalance ){
		$("#action-error").text("Not enough available balance").show();

	}else{

		changeForeground("loader", "show");
		var appendToElement;
		$(".stock-actions").each(function () {
			var elementStockId =  $(this).attr("data-stock-id");

			if( elementStockId == stockId){
				appendToElement = $(this).parent().find(".open-positions");
			}
		});
		var buySellLink = "services/buySellStock.php";
		$.ajax({
			method:"GET",
			url:buySellLink,
			dataType:"JSON",
			data:{
				stockId:stockId,
				stockName:stockName,
				stockPrice:stockPrice,
				stockQuantity:stockQuantity,
				positionType:positionType,
				profitCloseStatus:profitCloseStatus,
				profitCloseMax:profitCloseMax,
				lossCloseStatus:lossCloseStatus,
				lossCloseMax:lossCloseMax
			}
		}).done(function(objData){
			var positionId = objData.positionId;
			getUserData();
			setTimeout(function () {
				objActionWindow.close();
				changeForeground("loader", "hide");
			},500);

		});
	}
});

// Update total to pay, when user changes quntity
$(document).on("keyup", "#action-stock-quantity", function (event) {
	objActionWindow.updateTotal();
});



/**************  OTHER FUNCTIONALITIES ***************/

// SHOW/HIDE CHART
$(document).on("click", "#show-hide-chart", function () {
	if( $("#chart").is(":visible") ){
		$(this).text("SHOW CHART");
	}else{
		$(this).text("HIDE CHART");
	}
	$("#chart").toggle("slide", {direction:"down"}, 400);	
});

// Change chart displaying currency
$(document).on("click", ".currency-item", function () {
	if( $(this).attr("id") != "active-item"){
		$("#active-item").removeAttr("id");
		$(this).attr("id", "active-item");
		chart.options.data[0].dataPoints = [];
	}
});










/******************************  APP ******************************/


function tick() {

	var userTotalProfit = 0;
	var allPositionsValue = 0;

	var length = 20;

	for(var i = 0; i < length; i++){


		var objCurrency = arrCurrencies[i].resource.fields;
		var currencyId = objCurrency.id;
		var currencyName = objCurrency.name;
		var currencyPrice = objCurrency.price;

		var textColor = "secondary-text";

		if(localStorage.currencies){
			var strCurrenciesLS = localStorage.currencies;
			var arrCurrenciesLS = JSON.parse(strCurrenciesLS);
			var currencyPriceLS = arrCurrenciesLS[i].resource.fields.price;	

			if( currencyPrice > currencyPriceLS){
				textColor = "green-text";
			}
			else if( currencyPrice < currencyPriceLS ){
				textColor = "red-text";
			}else{
				textColor = "secondary-text";
			}
		}

		var currencyBuyPrice = currencyPrice + 0.0004;
		currencyBuyPrice = currencyBuyPrice.toFixed(4);
		currencyBuyPrice = Number(currencyBuyPrice);

		var currencySellPrice = currencyPrice - 0.0004;
		currencySellPrice = currencySellPrice.toFixed(4);
		currencySellPrice = Number(currencySellPrice);

		var elmId = "";

		var correctElement = ":eq(" + i + ")";

		// call update stock function
		updateStock (correctElement, textColor, currencyBuyPrice, currencySellPrice);
		updateChart(correctElement, currencyId, currencyPrice, currencyName, i);

		// update currency price in action window
		var btnSubmitAction = $("#action-submit-action");
		var actionCurrencyId = btnSubmitAction.attr("data-stock-id");
		var actionType = btnSubmitAction.text();

		var elmCurrencyPrice = $("#action-stock-price");
		var actionCurrencyPrice;
		if(actionType == "BUY"){
			actionCurrencyPrice = currencyBuyPrice;
		}else{
			actionCurrencyPrice = currencySellPrice;
		}

		if(currencyId == actionCurrencyId){
			elmCurrencyPrice.text(actionCurrencyPrice);
			objActionWindow.updateTotal();
		}


		var elmCurrency = $(".currency-item:eq(" + i + ")");
		var elmPosition = elmCurrency.find(".open-positions");
		var elmOpenPositions = elmPosition.find(".open-position");
		var openPositionsCount = elmOpenPositions.length;

		//get user open position
		var userOpenPositions = objUser.openPositions;
		var positionsCount = userOpenPositions.length;
		var c = positionsCount;



		while(c--){
			var objPosition = userOpenPositions[c];
			var positionId = objPosition.positionId;
			var positionCurrencyId = objPosition.stockId;
			var positionType = objPosition.positionType;
			var positionQuantity = objPosition.stockQuantity;
			var positionCurrencyPrice = objPosition.stockPrice;


			/*
				get user profit/loos from position
				and position value = quentity * price
			*/
			if(positionCurrencyId == currencyId){
	
				var positionProfitAndValue = getPositionProfitAndValue(objCurrency, objPosition);

				var positionProfit = positionProfitAndValue.profit;
				userTotalProfit += positionProfit;

				var positionValue = positionProfitAndValue.value;
				allPositionsValue += positionValue;

				var positionIsAppended = 0;
				for(var p = 0; p < openPositionsCount; p ++){
					var openPositionPerStock = $(elmOpenPositions[p]);

					var thisPositionId = openPositionPerStock.find(".close-position").attr("data-position-id");		
					if(thisPositionId == positionId){
						positionIsAppended = 1;
						var elmOpenPositionProfit = openPositionPerStock.find(".open-position-profit");
						elmOpenPositionProfit.text( convertToCurrency(positionProfit) );

						// Close position if close min/max is set
						var positionProfitCloseTriger = objPosition.profitCloseStatus;
						var positionMaxProfit = objPosition.profitCloseMax;
						var positionLossCloseTriger = objPosition.lossCloseStatus;
						var positionMaxLoss = objPosition.lossCloseMax;
						positionMaxLoss = positionMaxLoss - (2 * positionMaxLoss);

						if(positionProfitCloseTriger == 1){
							if( positionMaxProfit < positionProfit){
								closePosition(openPositionPerStock.find(".close-position"));
								spawnNotification("Position closed", currencyName, positionProfit);
							}
						}
						if(positionLossCloseTriger == 1){
							if( positionMaxLoss > positionProfit){
								closePosition(openPositionPerStock.find(".close-position"));
								spawnNotification("Position closed", currencyName, positionProfit);
							}
						}
					}
				}
				if(positionIsAppended == 0){
					var openPositionLayout = openPositionTemplate.replace("{{POSITION_TYPE}}", positionType);
					openPositionLayout = openPositionLayout.replace("{{POSITION_ID}}", positionId);
					openPositionLayout = openPositionLayout.replace("{{CURRENCY_PRICE}}", positionCurrencyPrice);
					openPositionLayout = openPositionLayout.replace("{{POSITION_PROFIT}}", convertToCurrency(positionProfit) );

					elmPosition.append(openPositionLayout);	
				}
			}
		}
	}
	var userEquity = allPositionsValue + objUser.availableBalance;

	displayUserData(objUser.availableBalance, userEquity, userTotalProfit);
	var strCurrencies = JSON.stringify(arrCurrencies);
	localStorage.currencies = strCurrencies;
}


var tickerId;
function startTicker(){
	tickerId = setInterval(function () {
		getCurrencies(tick);
	}, 1000);
}



/******************************  RUN APP  ******************************/


(function () {
		var strLink = "authentication/checkForLogin.php";
		$.ajax({
			url:strLink,
			method:"GET",
			dataType:"JSON",
			cache:false
		}).done(function (objData) {
			var response = objData.status;
			if(response == "true"){
				objUser = objData.objUser;
				getCurrencies(displayCurrencies);
			}else{
				changeForeground("loader", "hide");
			}
		});
})();


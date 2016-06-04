'use strict';

/* Controller */
angular.module('myApp.controllers', []).
	controller('AppCtrl', function ($scope, $http) {
		// Insert controller code here
		$scope.apparelCode;
		$scope.apparelColour;
        $scope.colorCode;
		$scope.apparelSize;
        $scope.sizeCode;
		$scope.apparelQuantity = 1;
        $scope.weight;
        $scope.foundsr = false;
        $scope.foundcc = false;
        $scope.foundsc = false;
        $scope.loading = true;

        // GETTING THE LIST OF APPAREL
        $http.get('/api/apparel/:styleCode?').then(function(apparel, status) {
                $scope.apparel = apparel.data;
        });        

		$scope.quote = function() {
            if($scope.apparelCode !== undefined){
                $scope.apparelCode = $scope.apparelCode.toUpperCase();
            }
            if ($scope.apparelColour !== undefined){
                $scope.apparelColour = $scope.apparelColour.toUpperCase();
            }
            if( $scope.apparelSize !== undefined){
                $scope.apparelSize = $scope.apparelSize.toUpperCase();
            }
            // ITERATING THROUGH THE APPAREL LIST, CHECKING FOR STYLE CODE MATCH
            $scope.apparel.forEach(function(item){
                if(item.style_code === $scope.apparelCode){
                    var ccodes = item.color_codes.split(";");
                    // CHECKING FOR COLOR CODE MATCH
                    ccodes.forEach(function(item){
                        var temp = item.split(":");
                        temp.forEach(function(item, index){
                            if(item === $scope.apparelColour){
                                $scope.colorCode = temp[index-2];
                                $scope.foundcc = true;
                            }
                        });
                    });
                    var scodes = item.size_codes.split(";");
                    // CHECKING FOR SIZE CODE MATCH
                    scodes.forEach(function(item){
                        var tempB = item.split(":");
                        tempB.forEach(function(item, index){
                            if(item === $scope.apparelSize){
                                $scope.sizeCode = tempB[index-1];
                                $scope.foundsc = true;
                            }
                        });
                    });
                    $scope.weight = item.weight;
                    $scope.foundsr = true;
                }
            });
            // HANDLING INVALID INPUT
            if(!$scope.foundsr){
                $scope.errorMsg = "Style Code: "+($scope.apparelCode === undefined ? "Empty field" : $scope.apparelCode);
                document.getElementById("errors").className = "show";
                document.getElementById('final_display').className = "hidden";
            }
            else if(!$scope.foundcc){
                $scope.errorMsg = "Color Code: "+($scope.apparelColour === undefined ? "Empty field" : $scope.apparelColour);
                document.getElementById("errors").className = "show";
                document.getElementById('final_display').className = "hidden";
            }
            else if(!$scope.foundsc){
                $scope.errorMsg = "Size Code: "+($scope.apparelSize === undefined ? "Empty field" : $scope.apparelSize);
                document.getElementById("errors").className = "show";
                document.getElementById('final_display').className = "hidden";
            }
            // CALCULATING THE COST
            if($scope.foundsr && $scope.foundcc && $scope.foundsc){
                var info = {sr: $scope.apparelCode, cc: $scope.colorCode, sc: $scope.sizeCode};
                document.getElementById('final_display').className = "hidden";
                document.getElementById('errors').className = "hidden";
                document.getElementById("loading").className = "show";
                // GRABBING THE PRICE
                $http.post('/api/quote', info).then(function(price, status) {
                    $scope.loading = false;
                    $scope.basicPrice = Number(price.data);
                    $scope.totalBasicPrice = $scope.basicPrice*$scope.apparelQuantity;
                    var shipping;
                    /****************************
                    Calculating Shipping Cost
                    ****************************/
                    if ($scope.weight < 0.4){
                        if($scope.apparelQuantity < 48){
                            shipping = 1.00 * $scope.apparelQuantity;
                        }
                        else {
                            shipping = 0.75 * $scope.apparelQuantity;
                        }
                    }
                    else {
                        if($scope.apparelQuantity < 48){
                            shipping = 0.50 * $scope.apparelQuantity;
                        }
                        else {
                            shipping = 0.25 * $scope.apparelQuantity;
                        }
                    }
                    // ADDING SHIPPING COST TO PRICE
                    $scope.finalPriceShipping = $scope.totalBasicPrice+shipping;
                    // ADDING SALESMAN COMPENSATION TO PRICE
                    $scope.finalPriceComp = 1.07 * $scope.finalPriceShipping;
                    // FINAL MARKUP
                    if($scope.finalPriceComp <= 800){
                        $scope.finalPrice = (1.50 * $scope.finalPriceComp).toFixed(2);
                    }
                    else {
                        $scope.finalPrice = (1.45 * $scope.finalPriceComp).toFixed(2);
                    }
                    $scope.finalPricePerItem = $scope.finalPrice/$scope.apparelQuantity;
                    $scope.perItem = ($scope.finalPricePerItem).toFixed(2);
                    document.getElementById('errors').className = "hidden";
                    document.getElementById("loading").className = "hidden";
                    document.getElementById('final_display').className = "nothidden";

                });
                $scope.foundsc = false;
                $scope.foundsr = false;
                $scope.foundcc = false;
            }

  		};
		
	});
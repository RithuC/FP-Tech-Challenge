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
		$scope.apparelQuantity;
        $scope.weight;

        $http.get('/api/apparel/:styleCode?').then(function(apparel, status) {
                $scope.apparel = apparel.data;
                //console.log($scope.apparel);
        });        

		$scope.quote = function() {
    		//console.log( $scope.apparelCode);
    		//console.log( $scope.apparelColour);
    		//console.log( $scope.apparelSize);
    		//console.log( $scope.apparelQuantity);
            $scope.apparelCode = $scope.apparelCode.toUpperCase();
            $scope.apparelColour = $scope.apparelColour.toUpperCase();
            $scope.apparelSize = $scope.apparelSize.toUpperCase();
            var foundsr = false;
            var foundcc = false;
            var foundsc = false;

            $scope.apparel.forEach(function(item){
                if(item.style_code === $scope.apparelCode){
                    //console.log("it matches");
                    //console.log(item.color_codes);
                    var ccodes = item.color_codes.split(";");
                    //console.log(ccodes);
                    ccodes.forEach(function(item){
                        var temp = item.split(":");
                        temp.forEach(function(item, index){
                            if(item === $scope.apparelColour){
                                $scope.colorCode = temp[index-2];
                                foundcc = true;
                                //console.log($scope.colorCode);
                                //break;
                            }
                        });
                    });
                    //console.log(item.size_codes);
                    var scodes = item.size_codes.split(";");
                    //console.log(scodes);
                    scodes.forEach(function(item){
                        var tempB = item.split(":");
                        tempB.forEach(function(item, index){
                            if(item === $scope.apparelSize){
                                $scope.sizeCode = tempB[index-1];
                                foundsc = true;
                                //console.log($scope.sizeCode);
                                //break;
                            }
                        });
                    });
                    $scope.weight = item.weight;
                    foundsr = true;
                    //break;
                }
                if(!foundsr){
                    $scope.errorMsg = "Style Code: "+($scope.apparelCode === undefined ? "Empty field" : $scope.apparelCode);
                    document.getElementById("errors").className = "show";
                }
                else if(!foundcc){
                    $scope.errorMsg = "Color Code: "+($scope.apparelColour === undefined ? "Empty field" : $scope.apparelColour);
                    document.getElementById("errors").className = "show";
                }
                else if(!foundsc){
                    $scope.errorMsg = "Size Code: "+($scope.apparelSize === undefined ? "Empty field" : $scope.apparelSize);
                    document.getElementById("errors").className = "show";
                }
            });
            if(foundsr && foundcc && foundsc){
                var info = {sr: $scope.apparelCode, cc: $scope.colorCode, sc: $scope.sizeCode};
                $http.post('/api/quote', info).then(function(price, status) {
                    console.log(Number(price.data));
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
                    // Adding Shipping Cost to Price
                    $scope.finalPriceShipping = $scope.totalBasicPrice+shipping;
                    // Adding Salesmean Compensation to Price
                    $scope.finalPriceComp = 1.07 * $scope.finalPriceShipping;
                    // Final Markup
                    if($scope.finalPriceComp <= 800){
                        $scope.finalPrice = (1.50 * $scope.finalPriceComp).toFixed(2);
                    }
                    else {
                        $scope.finalPrice = (1.45 * $scope.finalPriceComp).toFixed(2);
                    }
                    $scope.finalPricePerItem = $scope.finalPrice/$scope.apparelQuantity;
                    $scope.perItem = ($scope.finalPricePerItem).toFixed(2);
                    document.getElementById('errors').className = "hidden";
                    document.getElementById('final_display').className = "nothidden";

                });
            }

  		};
		
	});
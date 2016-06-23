(function(angular) {
	angular.module('PriceApp', ['ngRoute'])
  
	.controller('MainController', function($scope, $http, $route, $routeParams, $location) {
		
		$scope.$route = $route;
		$scope.$location = $location;
		$scope.$routeParams = $routeParams;
		
		$http.get("json/navbar-meteo-nc.json")
			.success(function (res) {
			$scope.navbar_meteonc = res.navbar_meteonc;

		})
		.catch(function (err) {
			console.log("Error on navbar loading");
		})
		.finally(function () {

		});
		
		
		$http.get("json/navbar-meteo-wg.json")
			.success(function (res) {
			$scope.navbar_wg = res.navbar_wg;

		})
		.catch(function (err) {
			console.log("Error on navbar WG loading" + err);
		})
		.finally(function () {
			console.log("Navbar loaded");
		});
		
	})

	.controller('CreateWindController', function($scope, $routeParams, $filterFilter) {
		$scope.name = "CreateWindController";
		$scope.params = $routeParams;
	})
	

	.controller("CtrlWeatherForecastWg", function ($scope, $http, $filter, $location, $routeParams) {

		$scope.gridOptions = {
			multiSelect: true,
			filterOptions: $scope.filterOptions,
			showColumnMenu: true    
		  };
		  
		// Getting city code
		var spotCode = $routeParams.spot;
		if(spotCode == null){
			spotCode = "noumea";
		}
		//var jsonUrl = "json/meteo-wg-"+ spotCode.formatFile() + ".json";
		var jsonUrl = "http://localhost:3002/meteo_wg/"+ spotCode;
		
			
		// Show loading spinner.
		$scope.loading = true;
		$scope.Math = window.Math;
		$scope.Date = Date;
		$scope.myparam = 1;
			
		// Loading requested data
		$http.get(jsonUrl)
		
		.success(function (res) {
			$scope.forecast_windguru = res.forecast_windguru;			
			$scope.showMessage = true;		
			console.log(res);
		})
		.catch(function (err) {
			console.log(err)
		})
		.finally(function () {
			$scope.loading = false;
		});


	
        $scope.dtFilter = function(item, options) {
			$scope.myval = getTimestampDay($scope.myparam);
			return item.dt < $scope.myval ; 
		};

		$scope.today = function() {		
			$scope.myparam = 1;
		};
		
        $scope.tomorrow = function() {		
			$scope.myparam = 2;
		};
		
        $scope.thedayaftertomorrow = function() {		
			$scope.myparam = 3;
		};
		
	
	})

	
	.controller("CtrlLast6StrongestsWindsNc", function ($scope, $http, $filter, $location, $routeParams) {
		
		$scope.gridOptions = {
			multiSelect: true,
			filterOptions: $scope.filterOptions,
			showColumnMenu: true    
		  };	 

		// Getting city code
		var spotCode = $routeParams.spot;
		if(spotCode == null){
			spotCode = "anse_vata";
		}
		//var jsonUrl = "json/meteo-nc-"+ spotCode +".json"
		var jsonUrl = "http://localhost:3002/meteo_nc_get_strongests_winds"
	
		// Show loading spinner.
		$scope.loading = true;
		$scope.Math = window.Math;
		$scope.Date = Date;
		$scope.myparam = 1;
		
		var dateOfToday = new Date();
		var sDateOfToday = dateOfToday.getFullYear() + '' + (dateOfToday.getMonth()+1) + ''+ dateOfToday.getDate();
		$scope.dateoftoday = sDateOfToday;
		
		
		// Loading requested data
		$http.get(jsonUrl)
		.success(function (res) {
			$scope.forecast_meteonc = res.forecast_meteonc;
			$scope.showMessage = true;		
		})
		.catch(function (err) {
			//console.log(res)
		})
		.finally(function () {
			$scope.loading = false;
		});


	
        $scope.dtFilter = function(item, options) {
			$scope.myval = getTimestampDay($scope.myparam);
			return item.dt < $scope.myval ; 
		};

		$scope.today = function() {		
			$scope.myparam = 1;
		};
		
        $scope.tomorrow = function() {		
			$scope.myparam = 2;
		};
		
        $scope.thedayaftertomorrow = function() {		
			$scope.myparam = 3;
		};
		
	
	})
	
	
	.controller("CtrlWeatherForecastNc", function ($scope, $http, $filter, $location, $routeParams) {
		
		$scope.gridOptions = {
			multiSelect: true,
			filterOptions: $scope.filterOptions,
			showColumnMenu: true    
		  };	 

		// Getting city code
		var spotCode = $routeParams.spot;
		if(spotCode == null){
			spotCode = "anse_vata";
		}
		//var jsonUrl = "json/meteo-nc-"+ spotCode +".json"
		var jsonUrl = "http://localhost:3002/meteo_nc/"+ spotCode
	
		// Show loading spinner.
		$scope.loading = true;
		$scope.Math = window.Math;
		$scope.Date = Date;
		$scope.myparam = 1;
		
		var dateOfToday = new Date();
		var sDateOfToday = dateOfToday.getFullYear() + '' + (dateOfToday.getMonth()+1) + ''+ dateOfToday.getDate();
		$scope.dateoftoday = sDateOfToday;
		
		
		// Loading requested data
		$http.get(jsonUrl)
		.success(function (res) {
			$scope.forecast_meteonc = res.forecast_meteonc;
			$scope.showMessage = true;		
		})
		.catch(function (err) {
			//console.log(res)
		})
		.finally(function () {
			$scope.loading = false;
		});


	
        $scope.dtFilter = function(item, options) {
			$scope.myval = getTimestampDay($scope.myparam);
			return item.dt < $scope.myval ; 
		};

		$scope.today = function() {		
			$scope.myparam = 1;
		};
		
        $scope.tomorrow = function() {		
			$scope.myparam = 2;
		};
		
        $scope.thedayaftertomorrow = function() {		
			$scope.myparam = 3;
		};
		
	
	})

	
		
	// Routing conf.
	.config(function($routeProvider, $locationProvider) {
		
	
		
		$routeProvider	
				
		.when('/', {
			templateUrl: 'views/item-home.html',
			controller: 'CtrlLast6StrongestsWindsNc',
		})
		
		
		
		.when('/spot_nc/:spot', {
			templateUrl: 'views/item-forecast_meteonc.html',
			controller: 'CtrlWeatherForecastNc',
			controllerAs: "app"
		})
		
		.when('/spot_wg/:spot', {
			templateUrl: 'views/item-forecast_windguru.html',
			controller: 'CtrlWeatherForecastWg',
			controllerAs: "app"
		})
		
		
		// configure html5 to get links working on jsfiddle
		
		$locationProvider.html5Mode({
		  // Disable to make $routerParam working in our controller
		  enabled: true,
		  requireBase: true
		});

				
      //console.log($locationProvider);

	});
	

})(window.angular);	

function getTimestampDay(index){
	var today = new Date();
	var tomorrow = new Date(today);
	tomorrow.setDate(today.getDate()+index);						
	var tomorrow_time = tomorrow.getTime();
	timestamp = tomorrow_time.toString().substring(0,tomorrow_time.toString().length-3);
	return timestamp;
}


String.prototype.formatFile = function () {
	var accent = [
		/[\300-\306]/g, /[\340-\346]/g, // A, a
		/[\310-\313]/g, /[\350-\353]/g, // E, e
		/[\314-\317]/g, /[\354-\357]/g, // I, i
		/[\322-\330]/g, /[\362-\370]/g, // O, o
		/[\331-\334]/g, /[\371-\374]/g, // U, u
		/[\321]/g, /[\361]/g, // N, n
		/[\307]/g, /[\347]/g, // C, c
	];
	var noaccent = ['A', 'a', 'E', 'e', 'I', 'i', 'O', 'o', 'U', 'u', 'N', 'n', 'C', 'c'];

	var str = this;
	if (str != null) {

		for (var i = 0; i < accent.length; i++) {
			str = str.replace(accent[i], noaccent[i]);
			str = str.replace(" ", "_").toLowerCase();
		}

	}
	return str;
}

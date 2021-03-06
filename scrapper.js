var Scrapper = function () {};

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

Scrapper.prototype.getCurrMeteoNCWindspeed = function () {
	
	var request = require('request');
	var moment = require('moment-timezone');

	/*
	var c = moment.tz(1450798200000, "Pacific/Noumea");
	//var c = moment.tz(1450798200000, "Europe/Paris");
	console.log(c);
	*/
	backHours = 0;
	//var _SERVER = "http://localhost:666/meteo-data/wg-data-realtime-unique.js";
	var _SERVER = "https://windguru.cz/int/iapi.php?callback=&q=station_data_last&id_station=99&hours=1&avg_minutes=0.5&back_hours=0&graph_info=1&_=1450734033114";

	request(_SERVER, function (error, response, html) {
	
		if (!error && response.statusCode == 200) {
			
			// Building jsVARIABLE from WG SPOT
			eval(" var jSonResponse = (" + html + ");");
			
			var jSonWgRealTimeArr = [];
			
			//var sWindMax = jSonResponse.wind_max[jSonResponse.wind_max.length-1];
			var sWindAvg = jSonResponse.wind_avg[jSonResponse.wind_avg.length-1];
			
			// Building JSON Content file
			var jsonObj = {
				"spot":"Méridien",
				"current_windspeed":sWindAvg
			}
			console.log("Current windspeed is : " +  sWindAvg);
			console.log("...Writing Content File \t\t wg-meridien-realtime-unique.json");
			var fs = require('fs');
			fs.writeFile(__dirname + "\\app\\json\\wg-meridien-realtime-unique.json", JSON.stringify(jsonObj), function (err) {
				if (err) {
					return console.log(err);
				}
			});			
			
		}
	});	
}

// https://www.windguru.cz/int/iapi.php?callback=&q=station_data_last&id_station=99&hours=100&avg_minutes=10&back_hours=100&graph_info=1&_=1450734033114
// Generating content and navigation bar for meteonc data
Scrapper.prototype.parseWgMeridienSpot = function (idStation, hours, avgMinutes, backHours) {
	
	var request = require('request');
	var moment = require('moment-timezone');

	/*
	var c = moment.tz(1450798200000, "Pacific/Noumea");
	//var c = moment.tz(1450798200000, "Europe/Paris");
	console.log(c);
	*/
	backHours = 0;
	//var _SERVER = "http://localhost:666/meteo-data/wg-data-realtime.js";
	var _SERVER = "https://www.windguru.cz/int/iapi.php?callback=&q=station_data_last&id_station="+ idStation +"&hours="+ hours +"&avg_minutes="+ avgMinutes +"&back_hours="+ backHours +"&graph_info=1&_=1450734033114";

	request(_SERVER, function (error, response, html) {
	
		if (!error && response.statusCode == 200) {
			
			// Building jsVARIABLE from WG SPOT
			eval(" var jSonResponse = (" + html + ");");
			
			var jSonWgRealTimeArr = [];

			
			for(iJson=0;iJson<jSonResponse.datetime.length;iJson++){
				
				// Initialize variables
				var sDateTime = jSonResponse.datetime[iJson];
				var sUnixTime = (jSonResponse.unixtime[iJson]*1000)+39600000;
				
				var sWindAvg = jSonResponse.wind_avg[iJson];
				var sWindMax = jSonResponse.wind_max[iJson];
				var sWindMin = jSonResponse.wind_min[iJson];
				var sWindDirection = jSonResponse.wind_direction[iJson];
				var sGustiness = jSonResponse.gustiness[iJson];		
				
				var aData = [sUnixTime, sWindMin, sWindMax];
				jSonWgRealTimeArr.push(aData);
				
			}
			var sStartStamp = jSonResponse.startstamp;
			var sEndStamp = jSonResponse.startstamp;

			var currentdate = new Date(); 
			var datetime = "Last Sync: " + currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/" 
                + currentdate.getFullYear() + " @ "  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds();
			console.log(datetime);
				
			console.log("...Writing Content File \t\t wg-meridien-realtime.json");
			var fs = require('fs');
			fs.writeFile(__dirname + "\\app\\json\\wg-meridien-realtime.json", JSON.stringify(jSonWgRealTimeArr), function (err) {
				if (err) {
					return console.log(err);
				}
			});			
			
		}
	});

}


// Generating content and navigation bar for meteonc data
Scrapper.prototype.parseSpotMeteoNc = function () {

	// Importing modules
	var fs = require('fs');
	var cheerio = require('cheerio');
	var path = require('path');
	var request = require('request');
	var sSpotList = null;
 
	//	Json NavBar
	var jsonNavBarArr = [];
	var jsonNavBar = {};
	
	//var _SERVER = "http://localhost:666/meteo-data/activites-nautiques.html";
	var _SERVER = "http://www.meteo.nc/nouvelle-caledonie/mer/activites-nautiques?zone=sud";

	var _SERVER_CHILD = "http://www.meteo.nc/index.php?option=com_ajax&module=mer_activites&method=getSpot&format=raw&Itemid=144&&zone=sud&spot=";
	var _SERVER = "http://www.meteo.nc/nouvelle-caledonie/mer/activites-nautiques?zone=sud";


	request(_SERVER, function (error, response, html, callback ) {
		if (!error && response.statusCode == 200) {
			sSpotList = html;

			var $spotList = cheerio.load(sSpotList);

			if ($spotList != null) {
				$spotList('.spotIMG').each(function (i, elem) {

					// Loading file sync
					var fs2 = require('fs');
					var spotName = $spotList(this).attr('title');
					var fileContent = null;
					
					//	Json NavBar line 60
					var jsonNavBar = {};
					jsonNavBar.spot = spotName;
					jsonNavBar.url = spotName.formatFile();
					jsonNavBarArr.push(jsonNavBar);					
			
					var _SERVER_CHILD_URL;
					if(spotName == 'Poe'){
						_SERVER_CHILD_URL = _SERVER_CHILD + 'getSpot-poe.html';
					}
					if(spotName == 'Anse Vata'){
						_SERVER_CHILD_URL = _SERVER_CHILD + 'getSpot-ansevata.html';
					}
					if(spotName == 'Ténia'){
						_SERVER_CHILD_URL = _SERVER_CHILD + 'getSpot-tenia.html';
					}
					var _SERVER_CHILD_URL = _SERVER_CHILD + encodeURIComponent(spotName);
					
						console.log(_SERVER_CHILD_URL + encodeURIComponent(spotName));
//console.log("the last "+ _SERVER_CHILD_URL );
//process.exit();
						request(_SERVER_CHILD_URL , function (error, response, html) {

							if (!error && response.statusCode == 200) {
							
								fileContent = html;

								// Parsing HTML File
								if (fileContent != null) {

									// Loading file content int $
									var $ = cheerio.load(fileContent);


									// Init json arrays
									var jsonArr = [];

									var iCtTable = 0;
									while (iCtTable <= 1) {

										// Dates
										var sDate1 = $('table:nth-child(1) tr:nth-child(1) th:nth-child(2)').eq(iCtTable).text();
										var sDate2 = $('table:nth-child(1) tr:nth-child(1) th:nth-child(3)').eq(iCtTable).text();
										var sDate3 = $('table:nth-child(1) tr:nth-child(1) th:nth-child(4)').eq(iCtTable).text();

										// Moments
										var sTime1 = $('table:nth-child(1) tr:nth-child(2) th:nth-child(1)').eq(iCtTable).text();
										var sTime2 = $('table:nth-child(1) tr:nth-child(2) th:nth-child(2)').eq(iCtTable).text();
										var sTime3 = $('table:nth-child(1) tr:nth-child(2) th:nth-child(3)').eq(iCtTable).text();
										var sTime4 = $('table:nth-child(1) tr:nth-child(2) th:nth-child(4)').eq(iCtTable).text();
										var sTime5 = $('table:nth-child(1) tr:nth-child(2) th:nth-child(5)').eq(iCtTable).text();
										var sTime6 = $('table:nth-child(1) tr:nth-child(2) th:nth-child(6)').eq(iCtTable).text();

										// Wind direction
										var sWindDir1 = $('table:nth-child(1) tr:nth-child(5) td:nth-child(2) div').eq(iCtTable).text().trim();
										var sWindDir2 = $('table:nth-child(1) tr:nth-child(5) td:nth-child(3) div').eq(iCtTable).text().trim();
										var sWindDir3 = $('table:nth-child(1) tr:nth-child(5) td:nth-child(4) div').eq(iCtTable).text().trim();
										var sWindDir4 = $('table:nth-child(1) tr:nth-child(5) td:nth-child(5) div').eq(iCtTable).text().trim();
										var sWindDir5 = $('table:nth-child(1) tr:nth-child(5) td:nth-child(6) div').eq(iCtTable).text().trim();
										var sWindDir6 = $('table:nth-child(1) tr:nth-child(5) td:nth-child(7) div').eq(iCtTable).text().trim();

										// Sea temperature
										var sSeaTemp1 = $('table:nth-child(1) tr:nth-child(9) td:nth-child(2) div').eq(iCtTable).text().trim();
										var sSeaTemp2 = $('table:nth-child(1) tr:nth-child(9) td:nth-child(3) div').eq(iCtTable).text().trim();
										var sSeaTemp3 = $('table:nth-child(1) tr:nth-child(9) td:nth-child(4) div').eq(iCtTable).text().trim();

										var sTideTime1 = $('table:nth-child(1) tr:nth-child(10) td:nth-child(3)').eq(iCtTable).text().trim();
										var sTideTime2 = $('table:nth-child(1) tr:nth-child(10) td:nth-child(4)').eq(iCtTable).text().trim();
										var sTideTime3 = $('table:nth-child(1) tr:nth-child(10) td:nth-child(5)').eq(iCtTable).text().trim();
										var sTideTime4 = $('table:nth-child(1) tr:nth-child(10) td:nth-child(6)').eq(iCtTable).text().trim();
										var sTideTime5 = $('table:nth-child(1) tr:nth-child(10) td:nth-child(7)').eq(iCtTable).text().trim();
										var sTideTime6 = $('table:nth-child(1) tr:nth-child(10) td:nth-child(8)').eq(iCtTable).text().trim();
										var sTideTime7 = $('table:nth-child(1) tr:nth-child(10) td:nth-child(9)').eq(iCtTable).text().trim();
										var sTideTime8 = $('table:nth-child(1) tr:nth-child(10) td:nth-child(10)').eq(iCtTable).text().trim();
										var sTideTime9 = $('table:nth-child(1) tr:nth-child(10) td:nth-child(11)').eq(iCtTable).text().trim();
										var sTideTime10 = $('table:nth-child(1) tr:nth-child(10) td:nth-child(12)').eq(iCtTable).text().trim();
										var sTideTime11 = $('table:nth-child(1) tr:nth-child(10) td:nth-child(13)').eq(iCtTable).text().trim();
										var sTideTime12 = $('table:nth-child(1) tr:nth-child(10) td:nth-child(14)').eq(iCtTable).text().trim();

										var sTide1 = $('table:nth-child(1) tr:nth-child(11) td:nth-child(2)').eq(iCtTable).text().trim();
										var sTide2 = $('table:nth-child(1) tr:nth-child(11) td:nth-child(3)').eq(iCtTable).text().trim();
										var sTide3 = $('table:nth-child(1) tr:nth-child(11) td:nth-child(4)').eq(iCtTable).text().trim();
										var sTide4 = $('table:nth-child(1) tr:nth-child(11) td:nth-child(5)').eq(iCtTable).text().trim();
										var sTide5 = $('table:nth-child(1) tr:nth-child(11) td:nth-child(6)').eq(iCtTable).text().trim();
										var sTide6 = $('table:nth-child(1) tr:nth-child(11) td:nth-child(7)').eq(iCtTable).text().trim();
										var sTide7 = $('table:nth-child(1) tr:nth-child(11) td:nth-child(8)').eq(iCtTable).text().trim();
										var sTide8 = $('table:nth-child(1) tr:nth-child(11) td:nth-child(9)').eq(iCtTable).text().trim();
										var sTide9 = $('table:nth-child(1) tr:nth-child(11) td:nth-child(10)').eq(iCtTable).text().trim();
										var sTide10 = $('table:nth-child(1) tr:nth-child(11) td:nth-child(11)').eq(iCtTable).text().trim();
										var sTide11 = $('table:nth-child(1) tr:nth-child(11) td:nth-child(12)').eq(iCtTable).text().trim();
										var sTide12 = $('table:nth-child(1) tr:nth-child(11) td:nth-child(13)').eq(iCtTable).text().trim();

										// Init json arrays
										var jsonContent1 = {};
										var jsonContent2 = {};
										var jsonContent3 = {};
										var jsonContent4 = {};
										var jsonContent5 = {};
										var jsonContent6 = {};
										var jsonContent7 = {};
										var jsonContent8 = {};
										var jsonContent9 = {};
										var jsonContent10 = {};
										var jsonContent11 = {};
										var jsonContent12 = {};

										jsonContent1.spot = $('div#spotName').text();
										jsonContent2.spot = $('div#spotName').text();
										jsonContent3.spot = $('div#spotName').text();
										jsonContent4.spot = $('div#spotName').text();
										jsonContent5.spot = $('div#spotName').text();
										jsonContent6.spot = $('div#spotName').text();
										jsonContent7.spot = $('div#spotName').text();
										jsonContent8.spot = $('div#spotName').text();
										jsonContent9.spot = $('div#spotName').text();
										jsonContent10.spot = $('div#spotName').text();
										jsonContent11.spot = $('div#spotName').text();
										jsonContent12.spot = $('div#spotName').text();

										jsonContent1.date = sDate1;
										jsonContent2.date = sDate1;
										jsonContent3.date = sDate2;
										jsonContent4.date = sDate2;
										jsonContent5.date = sDate3;
										jsonContent6.date = sDate3;

										jsonContent1.sysdate = "";
										jsonContent1.sysdate = "";
										jsonContent2.sysdate = "";
										jsonContent2.sysdate = "";
										jsonContent3.sysdate = "";
										jsonContent3.sysdate = "";

										jsonContent1.moment = sTime1;
										jsonContent2.moment = sTime2;
										jsonContent3.moment = sTime3;
										jsonContent4.moment = sTime4;
										jsonContent5.moment = sTime5;
										jsonContent6.moment = sTime6;

										jsonContent1.wind = sWindDir1;
										jsonContent2.wind = sWindDir2;
										jsonContent3.wind = sWindDir3;
										jsonContent4.wind = sWindDir4;
										jsonContent5.wind = sWindDir5;
										jsonContent6.wind = sWindDir6;

										jsonContent1.water_temperature = sSeaTemp1;
										jsonContent2.water_temperature = sSeaTemp2;
										jsonContent3.water_temperature = sSeaTemp3;
										jsonContent4.water_temperature = sSeaTemp1;
										jsonContent5.water_temperature = sSeaTemp2;
										jsonContent6.water_temperature = sSeaTemp3;

										jsonContent1.tide_time_1 = sTideTime1;
										jsonContent1.tide_time_2 = sTideTime2;
										jsonContent2.tide_time_1 = sTideTime3;
										jsonContent2.tide_time_2 = sTideTime4;
										jsonContent3.tide_time_1 = sTideTime5;
										jsonContent3.tide_time_2 = sTideTime6;
										jsonContent4.tide_time_1 = sTideTime7;
										jsonContent4.tide_time_2 = sTideTime8;
										jsonContent5.tide_time_1 = sTideTime9;
										jsonContent5.tide_time_2 = sTideTime10;
										jsonContent6.tide_time_1 = sTideTime11;
										jsonContent6.tide_time_2 = sTideTime12;

										jsonContent1.tide_1 = sTide1;
										jsonContent1.tide_2 = sTide2;
										jsonContent2.tide_1 = sTide3;
										jsonContent2.tide_2 = sTide4;
										jsonContent3.tide_1 = sTide5;
										jsonContent3.tide_2 = sTide6;
										jsonContent4.tide_1 = sTide7;
										jsonContent4.tide_2 = sTide8;
										jsonContent5.tide_1 = sTide9;
										jsonContent5.tide_2 = sTide10;
										jsonContent6.tide_1 = sTide11;
										jsonContent6.tide_2 = sTide12;

										jsonContent1.tide_time_sys_1 = "";
										jsonContent2.tide_time_sys_1 = "";
										jsonContent3.tide_time_sys_1 = "";
										jsonContent4.tide_time_sys_1 = "";
										jsonContent5.tide_time_sys_1 = "";
										jsonContent6.tide_time_sys_1 = "";
										jsonContent1.tide_time_sys_1 = "";
										jsonContent2.tide_time_sys_1 = "";
										jsonContent3.tide_time_sys_1 = "";
										jsonContent4.tide_time_sys_1 = "";
										jsonContent5.tide_time_sys_1 = "";
										jsonContent6.tide_time_sys_1 = "";

										// Adding data to the array
										jsonArr.push(jsonContent1);
										jsonArr.push(jsonContent2);
										jsonArr.push(jsonContent3);
										jsonArr.push(jsonContent4);
										jsonArr.push(jsonContent5);
										jsonArr.push(jsonContent6);

										iCtTable++;

									}

									// Building JSON Content file
									var jsonObj = {
										'forecast_meteonc' : jsonArr
									};
									var jsFileToGenerate = spotName.formatFile();
									console.log("...Writing Content File \t\t json/meteo-nc-" + jsFileToGenerate + ".json");
									var fs = require('fs');
									fs.writeFile(__dirname + "\\app\\json\\meteo-nc-" + jsFileToGenerate + ".json", JSON.stringify(jsonObj), function (err) {
										if (err) {
											return console.log(err);
										}
									});

								}

							}

						});
					

				});

				// Building JSON Navbar file
				console.log("...Writing Navigation bar \t\t json/navbar-meteo-nc.json");
				var jsonObjNavBar = {
					'navbar_meteonc' : jsonNavBarArr
				};
				fs.writeFile(__dirname + "\\app\\json\\navbar-meteo-nc.json", JSON.stringify(jsonObjNavBar), function (err) {
					if (err) {
						return console.log(err);
					}
				});

			}

		}
	});


};

// Generating content and navigation bar for Windguru
Scrapper.prototype.parseSpotWindGuru = function () {

	// Importing modules
	var fs = require('fs');
	var cheerio = require('cheerio');
	var path = require('path');
	var request = require('request');

	var monthNames = [
		"Janvier", "Février", "Mars",
		"Avril", "Mai", "Juin", "Juillet",
		"Août", "Septembre", "Octobre",
		"Novembre", "Decembre"
	];

	var aWgSpotList = {
		"spot_list" : [{
				id : "4164",
				spot : "Nouméa"
			}, {
				id : "6470",
				spot : "Poe beach"
			}, {
				id : "208755",
				spot : "Anse Vata"
			}, {
				id : "208759",
				spot : "Ilôt Goeland"
			}, {
				id : "208762",
				spot : "Ouano"
			}, {
				id : "208767",
				spot : "Mou"
			}, {
				id : "91442",
				spot : "Meridien Nouméa"
			}, {
				id : "508849",
				spot : "Ouen Toro Sainte Marie"
			}, {
				id : "208764",
				spot : "Easo"
			}, {
				id : "6476",
				spot : "Ilôt Ténia"
			}, {
				id : "208766",
				spot : "Baie de Chateaubriand"
			}

		]
	};

	//	Json NavBar
	var jsonNavBarArr = [];
	var jsonNavBar = {};

	// ...Traversing through spot items
	for (var i = 0; i < aWgSpotList.spot_list.length; i++) {

		// Init variables
		sSpotName = aWgSpotList.spot_list[i].spot;
		sSpotId = aWgSpotList.spot_list[i].id;

		var fs2 = require('fs');
		var fileToCheck = "scrapper_data/getWindguruSpot.html";

		request('http://www.windguru.cz/fr/index.php?sc=' + sSpotId + '&sty=m_spot', function (error, response, html, sSpotId) {
		//request('http://localhost:666/meteo-data/getWindguruSpot.html', function (error, response, html, sSpotId) {
			if (!error && response.statusCode == 200) {


			
				fileContent = html;

				// Parsing HTML File
				if (fileContent != null) {

					var $sWgContent = cheerio.load(fileContent);
					var sWgJson = $sWgContent(".fcsttabf script").text().trim();

					sWgJson = sWgJson.replace("wgopts_1.lang = WgLang;");
					sWgJson = sWgJson.replace("WgFcst.showForecast(wg_fcst_tab_data_1,wgopts_1);");
					sWgJson = sWgJson.replace("wgopts_2.lang = WgLang;");
					sWgJson = sWgJson.replace("WgFcst.showForecast(wg_fcst_tab_data_2,wgopts_2);");

					// Using Wg Json object from webpage...
					eval(sWgJson);

					var aWgJsonData = [];
					var iMoments = 1;
					var iDaysForecast = 0;

					for (var iTpt = 0; iTpt < wg_fcst_tab_data_1.fcst["3"].TMP.length; iTpt++) {

						var sTemperature = wg_fcst_tab_data_1.fcst["3"].TMP[iTpt];
						var sWindSpeed = wg_fcst_tab_data_1.fcst["3"].WINDSPD[iTpt];
						var sDay = wg_fcst_tab_data_1.fcst["3"].hr_d[iTpt];
						var sHour = wg_fcst_tab_data_1.fcst["3"].hr_h[iTpt];
						var sWgJsonData = {};

						// Moments
						if (iMoments <= 3) {
							sMoment = "Matin";
						}
						if (iMoments > 3 && iMoments <= 6) {
							sMoment = "Apres-midi";
							if (iMoments == 6) {
								iMoments = 0;
							}
						}
						iMoments++;

						// Date
						if (iTpt % 8 == 0) {
							iDaysForecast++;
						}
						var wgDate = new Date();
						wgDate.setDate(wgDate.getDate() + iDaysForecast);
						var day = wgDate.getDate();
						var monthIndex = wgDate.getMonth();
						var year = wgDate.getFullYear();

						// Filling wg json
						sWgJsonData.date = day + ' ' + monthNames[monthIndex] + ' ' + year;
						sWgJsonData.moment = sMoment;
						sWgJsonData.hour = sHour;
						sWgJsonData.wind = sWindSpeed.toString();
						sWgJsonData.water_temperature = sTemperature.toString();
						sWgJsonData.city = wg_fcst_tab_data_1.spot.toString();

						aWgJsonData.push(sWgJsonData);
					}

					//	Json NavBar
					var jsonNavBar = {};
					jsonNavBar.spot = wg_fcst_tab_data_1.spot;
					jsonNavBar.url = wg_fcst_tab_data_1.spot.replace("New Caledonia - ", "").formatFile();
					jsonNavBarArr.push(jsonNavBar);

					// Building JSON Navbar file
					var jsFileToGenerate = wg_fcst_tab_data_1.spot.replace("New Caledonia - ", "").formatFile();
					console.log("...Writing WG Data \t\t json/meteo-wg-" + jsFileToGenerate + ".json");
					var sWgJsonDataFile = {
						'forecast_windguru' : aWgJsonData
					};
					fs.writeFile(__dirname + "\\app\\json\\meteo-wg-" + jsFileToGenerate + ".json", JSON.stringify(sWgJsonDataFile), function (err) {
						if (err) {
							return console.log(err);
						}
					});

				}

	// Building JSON Navbar file
	console.log("...Writing Navigation bar \t\t json/navbar-meteo-wg.json");
	var jsonObjNavBar = {
		'navbar_wg' : jsonNavBarArr
	};
	fs.writeFile(__dirname + "\\app\\json\\navbar-meteo-wg.json", JSON.stringify(jsonObjNavBar), function (err) {
		if (err) {
			return console.log(err);
		}
	});


			}
		});


	}
	return true;
}
exports.Scrapper = Scrapper;
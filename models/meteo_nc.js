var mongoose = require('mongoose'),
Schema = mongoose.Schema;

// Main schema
var NcWFMain = new Schema({
  spot:String,
  date:String,
  sysdate:String,
  update_date:String
});


// Windsoeed average
var NcWFWindSpeedAverage = new Schema({
  sysdate:String,
  wind_speed_average:String
});

// Windsoeed gut
var NcWFWindSpeedGut = new Schema({
  sysdate:String,
  wind_speed_gut:String
});

// Tides
var NcWFTides = new Schema({
  sysdate:String,
  tide_1:String,
  tide_2:String,
  tide_3:String,
  tide_4:String
});


NcWFMain.index({spot: 1, sysdate: 1}, {unique: true});
mongoose.model('NcWFWindSpeedGut', NcWFWindSpeedAverage);
mongoose.model('NcWFWindSpeedAverage', NcWFWindSpeedAverage);
mongoose.model('NcWFMain', NcWFMain);


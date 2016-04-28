var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var MeteoNCSchema = new Schema({
  spot:String,
  date:String,
  sysdate:String,
  moment:String,
  wind:String,
  water_temperature:String,
  tide_time_1:String,
  tide_time_2:String,
  tide_time_3:String,
  tide_time_4:String,
  tide_1:String,
  tide_2:String,
  tide_3:String,
  tide_4:String,
  tide_time_sys_1:String,
  update_date:String
});

//MeteoNCSchema.index({spot: 1, sysdate: 1, moment: 1, update_date: 1}, {unique: true});
mongoose.model('MeteoNC', MeteoNCSchema);


